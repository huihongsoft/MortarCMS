import { describe, it, expect } from 'vitest';
import { verifyWechatSignature, parseWechatXml, buildWechatReplyXml, dingtalkDecrypt, dingtalkVerifyMsgSignature, dingtalkCallbackSign } from '../src/routes/ai';

describe('DingTalk', () => {
  const AES_KEY = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG'; // 43 chars
  const crypto = require('crypto');

  it('round-trips AES-CBC encrypt/decrypt (DingTalk scheme: IV = key[0..16))', () => {
    const key = Buffer.from(AES_KEY + '=', 'base64');
    const cipher = crypto.createCipheriv('aes-256-cbc', key, key.subarray(0, 16));
    cipher.setAutoPadding(false);
    const plain = JSON.stringify({ msgSignature: 'x', timeStamp: '1', nonce: 'n', eventType: 'e', event: '{}' });
    // PKCS7 pad
    const block = 16;
    const pad = block - (Buffer.byteLength(plain) % block);
    const padded = Buffer.concat([Buffer.from(plain), Buffer.alloc(pad, pad)]);
    const enc = Buffer.concat([cipher.update(padded), cipher.final()]).toString('base64');
    expect(dingtalkDecrypt(AES_KEY, enc)).toBe(plain);
  });

  it('validates the inner msgSignature (sha1 of sorted [token, timeStamp, nonce, encrypt])', () => {
    const token = 'tok', timeStamp = '1700000000', nonce = 'n', encrypt = 'ciphertext';
    const sig = crypto.createHash('sha1').update([token, timeStamp, nonce, encrypt].sort().join('')).digest('hex');
    expect(dingtalkVerifyMsgSignature(token, timeStamp, nonce, encrypt, sig)).toBe(true);
    expect(dingtalkVerifyMsgSignature(token, timeStamp, nonce, encrypt, 'bad')).toBe(false);
  });

  it('computes the callback header sign as HMAC-SHA256(appSecret, timestamp) hex', () => {
    const appSecret = 'secret';
    const ts = '1700000000';
    const expected = crypto.createHmac('sha256', appSecret).update(ts).digest('hex');
    expect(dingtalkCallbackSign(appSecret, ts)).toBe(expected);
  });
});

describe('verifyWechatSignature', () => {
  it('accepts a correct signature (WeChat algorithm: sha1 of sorted concat)', () => {
    const token = 'mortartoken123';
    const timestamp = '1700000000';
    const nonce = 'abc123';
    const str = [token, timestamp, nonce].sort().join('');
    const sha1 = require('crypto').createHash('sha1').update(str).digest('hex');
    expect(verifyWechatSignature(token, timestamp, nonce, sha1)).toBe(true);
  });

  it('rejects a wrong signature', () => {
    expect(verifyWechatSignature('tok', '1', '2', 'deadbeef')).toBe(false);
  });

  it('rejects missing parameters', () => {
    expect(verifyWechatSignature('', '1', '2', 'x')).toBe(false);
    expect(verifyWechatSignature('tok', '', '2', 'x')).toBe(false);
  });
});

describe('parseWechatXml', () => {
  it('parses CDATA content', () => {
    const xml = '<xml><ToUserName><![CDATA[gh_abc]]></ToUserName><FromUserName><![CDATA[openid123]]></FromUserName><CreateTime>1700000000</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[你好，帮我写一篇文章]]></Content></xml>';
    expect(parseWechatXml(xml)).toEqual({ toUser: 'gh_abc', fromUser: 'openid123', content: '你好，帮我写一篇文章' });
  });

  it('parses raw (non-CDATA) content', () => {
    const xml = '<xml><ToUserName>gh_abc</ToUserName><FromUserName>openid123</FromUserName><Content>hello</Content></xml>';
    expect(parseWechatXml(xml)).toEqual({ toUser: 'gh_abc', fromUser: 'openid123', content: 'hello' });
  });

  it('handles empty content', () => {
    expect(parseWechatXml('<xml><ToUserName>a</ToUserName><FromUserName>b</FromUserName></xml>').content).toBe('');
  });
});

describe('buildWechatReplyXml', () => {
  it('builds a well-formed text reply with CDATA', () => {
    const xml = buildWechatReplyXml('openid123', 'gh_abc', '回复内容');
    expect(xml).toContain('<ToUserName><![CDATA[openid123]]></ToUserName>');
    expect(xml).toContain('<FromUserName><![CDATA[gh_abc]]></FromUserName>');
    expect(xml).toContain('<MsgType><![CDATA[text]]></MsgType>');
    expect(xml).toContain('<Content><![CDATA[回复内容]]></Content>');
    expect(xml).toContain('<CreateTime>');
  });

  it('escapes CDATA terminators inside content', () => {
    const xml = buildWechatReplyXml('a', 'b', 'x]]>y');
    expect(xml).not.toContain('<![CDATA[x]]>');
  });
});
