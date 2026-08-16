import { describe, it, expect } from 'vitest';
import { verifyWechatSignature, parseWechatXml, buildWechatReplyXml } from '../src/routes/ai';

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
