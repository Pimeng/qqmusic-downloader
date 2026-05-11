#!/usr/bin/env node

/**
 * QQ音乐 Cookie Base64 编码工具
 * 用于解决腾讯云 Pages 环境变量不能包含空格、换行等特殊字符的限制
 *
 * 用法:
 *   node encode-cookie.js "你的完整cookie字符串"
 *   node encode-cookie.js --from-file cookie.txt
 *   node encode-cookie.js --decode "base64编码的字符串"
 */

import { readFileSync, existsSync } from 'fs';

function encodeCookie(cookieStr) {
  // 去除多余空白
  const clean = cookieStr.replace(/\s+/g, ' ').trim();
  return Buffer.from(clean).toString('base64');
}

function decodeCookie(base64Str) {
  try {
    return Buffer.from(base64Str, 'base64').toString('utf-8');
  } catch (e) {
    console.error('解码失败:', e.message);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('QQ音乐 Cookie Base64 编码/解码工具');
    console.log('');
    console.log('编码用法:');
    console.log('  node encode-cookie.js "uin=xxx; qqmusic_key=xxx; ..."');
    console.log('  node encode-cookie.js --from-file cookie.txt');
    console.log('');
    console.log('解码用法:');
    console.log('  node encode-cookie.js --decode "eW91ciBiYXNlNjQgc3RyaW5n..."');
    console.log('');
    console.log('说明:');
    console.log('  腾讯云 Pages 环境变量值不能包含空格、换行、制表符');
    console.log('  使用此工具将 Cookie 编码为 base64 后存入环境变量');
    console.log('  服务端会自动检测并解码');
    process.exit(0);
  }

  if (args[0] === '--decode' || args[0] === '-d') {
    // 解码模式
    const base64Str = args[1];
    if (!base64Str) {
      console.error('错误: 请提供 base64 字符串');
      process.exit(1);
    }
    const decoded = decodeCookie(base64Str);
    console.log('\n解码结果:');
    console.log('='.repeat(60));
    console.log(decoded);
    console.log('='.repeat(60));
    return;
  }

  // 编码模式
  let cookieStr = '';
  if (args[0] === '--from-file' || args[0] === '-f') {
    const filePath = args[1];
    if (!filePath || !existsSync(filePath)) {
      console.error(`错误: 文件不存在: ${filePath}`);
      process.exit(1);
    }
    cookieStr = readFileSync(filePath, 'utf-8').trim();
  } else {
    cookieStr = args.join(' ');
  }

  const encoded = encodeCookie(cookieStr);

  console.log('\n' + '='.repeat(60));
  console.log('QQ音乐 Cookie Base64 编码结果');
  console.log('='.repeat(60));
  console.log('\n📊 原始长度:', cookieStr.length);
  console.log('📦 编码长度:', encoded.length);
  console.log('\n📝 Base64 编码字符串:');
  console.log('-'.repeat(60));
  console.log(encoded);
  console.log('-'.repeat(60));

  // 验证
  const decoded = decodeCookie(encoded);
  const match = decoded === cookieStr.replace(/\s+/g, ' ').trim();
  console.log('\n✅ 编码验证:', match ? '通过' : '失败');

  console.log('\n📋 使用说明:');
  console.log('  1. 复制上面的 Base64 字符串');
  console.log('  2. 在腾讯云 Pages 控制台 → 环境变量');
  console.log('  3. 变量名: QM_COOKIES');
  console.log('  4. 变量值: 粘贴上面的 Base64 字符串（无空格换行）');
  console.log('  5. 重新部署项目');
  console.log('='.repeat(60) + '\n');
}

main();
