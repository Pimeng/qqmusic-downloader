#!/usr/bin/env node

/**
 * QQ音乐 Cookie 关键字段提取器
 * 用法: node extract-cookie.js "你的cookie字符串"
 *    或 node extract-cookie.js --from-file cookie.txt
 */

import { readFileSync, existsSync } from 'fs';

// 关键字段定义：字段名 => { required: 是否必需, description: 说明, category: 分类 }
const FIELDS = {
  // === 核心认证字段 ===
  'qqmusic_key': {
    required: true,
    category: '认证',
    description: 'QQ音乐核心认证密钥（vkey请求必需）',
    aliases: ['qm_keyst']
  },
  'qm_keyst': {
    required: true,
    category: '认证',
    description: 'QQ音乐认证密钥别名'
  },

  // === 用户身份字段 ===
  'uin': {
    required: true,
    category: '身份',
    description: 'QQ号（QQ登录）',
    aliases: ['wxuin']
  },
  'wxuin': {
    required: true,
    category: '身份',
    description: '微信uin（微信登录）'
  },

  // === 登录类型字段 ===
  'wxunionid': {
    required: true,
    category: '登录类型',
    description: '微信unionid（微信登录标记）',
    aliases: ['psrf_qqunionid']
  },
  'psrf_qqunionid': {
    required: true,
    category: '登录类型',
    description: 'QQ unionid（QQ登录标记）'
  },
  'tmeLoginType': {
    required: true,
    category: '登录类型',
    description: '登录类型标识（1=微信, 2=QQ）'
  },
  'login_type': {
    required: false,
    category: '登录类型',
    description: '登录方式（辅助判断）'
  },

  // === Token 刷新字段（可选但推荐） ===
  'psrf_qqaccess_token': {
    required: false,
    category: 'Token',
    description: 'QQ访问令牌（用于刷新）'
  },
  'psrf_qqopenid': {
    required: false,
    category: 'Token',
    description: 'QQ OpenID（用于刷新）'
  },
  'psrf_qqrefresh_token': {
    required: false,
    category: 'Token',
    description: 'QQ刷新令牌'
  },
  'wxaccess_token': {
    required: false,
    category: 'Token',
    description: '微信访问令牌（用于刷新）'
  },
  'wxopenid': {
    required: false,
    category: 'Token',
    description: '微信OpenID（用于刷新）'
  },
  'wxrefresh_token': {
    required: false,
    category: 'Token',
    description: '微信刷新令牌'
  },
  'psrf_access_token_expiresAt': {
    required: false,
    category: 'Token',
    description: '令牌过期时间戳'
  },

  // === 辅助字段 ===
  'psrf_musickey_createtime': {
    required: false,
    category: '辅助',
    description: 'musickey创建时间'
  },
  'euin': {
    required: false,
    category: '辅助',
    description: '加密uin'
  },
};

function parseCookie(cookieStr) {
  const map = new Map();
  String(cookieStr).split(';').forEach(item => {
    const text = item.trim();
    if (!text) return;
    const index = text.indexOf('=');
    if (index < 0) return;
    map.set(text.slice(0, index).trim(), text.slice(index + 1).trim());
  });
  return map;
}

function findFieldValue(map, fieldName) {
  const field = FIELDS[fieldName];
  if (!field) return null;

  // 检查主字段
  if (map.has(fieldName) && map.get(fieldName) !== '') {
    return { key: fieldName, value: map.get(fieldName) };
  }

  // 检查别名
  if (field.aliases) {
    for (const alias of field.aliases) {
      if (map.has(alias) && map.get(alias) !== '') {
        return { key: alias, value: map.get(alias) };
      }
    }
  }

  return null;
}

function analyzeCookie(cookieStr) {
  const map = parseCookie(cookieStr);
  const found = new Map();
  const missing = [];

  for (const [key, config] of Object.entries(FIELDS)) {
    const result = findFieldValue(map, key);
    if (result) {
      found.set(key, result);
    } else if (config.required) {
      missing.push(key);
    }
  }

  // 检测登录类型
  let loginType = null;
  if (findFieldValue(map, 'wxunionid') || map.get('tmeLoginType') === '1') {
    loginType = '微信';
  } else if (findFieldValue(map, 'psrf_qqunionid') || map.get('tmeLoginType') === '2' || map.get('login_type') === '1') {
    loginType = 'QQ';
  }

  // 检查是否有其他可能相关的字段
  const unknownFields = [];
  for (const [key, value] of map.entries()) {
    if (!FIELDS[key]) {
      unknownFields.push({ key, value: value.substring(0, 50) + (value.length > 50 ? '...' : '') });
    }
  }

  return { found, missing, loginType, unknownFields, totalFields: map.size };
}

function formatCookieOutput(map, foundKeys) {
  const parts = [];
  for (const key of foundKeys) {
    const result = findFieldValue(map, key);
    if (result) {
      parts.push(`${result.key}=${result.value}`);
    }
  }
  return parts.join(';');
}

function main() {
  let cookieStr = '';

  // 解析命令行参数
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('用法:');
    console.error('  node extract-cookie.js "uin=xxx;qqmusic_key=xxx;..."');
    console.error('  node extract-cookie.js --from-file cookie.txt');
    process.exit(1);
  }

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

  const { found, missing, loginType, unknownFields, totalFields } = analyzeCookie(cookieStr);

  console.log('\n' + '='.repeat(60));
  console.log('QQ音乐 Cookie 解析报告');
  console.log('='.repeat(60));

  console.log(`\n📊 统计: 共 ${totalFields} 个字段, 识别出 ${found.size} 个关键字段`);

  if (loginType) {
    console.log(`🔑 登录类型: ${loginType}登录`);
  } else {
    console.log(`⚠️  登录类型: 无法识别`);
  }

  // 按分类显示找到的字段
  console.log('\n' + '-'.repeat(60));
  console.log('✅ 已识别的关键字段:');
  console.log('-'.repeat(60));

  const categories = {};
  for (const [key, result] of found.entries()) {
    const cat = FIELDS[key]?.category || '其他';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push({ key, result });
  }

  for (const [cat, items] of Object.entries(categories)) {
    console.log(`\n  [${cat}]`);
    for (const { key, result } of items) {
      const config = FIELDS[key];
      const valuePreview = result.value.length > 40
        ? result.value.substring(0, 37) + '...'
        : result.value;
      console.log(`    ${key}: ${valuePreview}`);
    }
  }

  // 显示缺失的必需字段
  if (missing.length > 0) {
    console.log('\n' + '-'.repeat(60));
    console.log('❌ 缺失的必需字段:');
    console.log('-'.repeat(60));
    for (const key of missing) {
      const config = FIELDS[key];
      console.log(`    ${key}: ${config.description}`);
    }
    console.log('\n⚠️  缺少必需字段可能导致无法获取高品质音频！');
  }

  // 显示未知字段
  if (unknownFields.length > 0) {
    console.log('\n' + '-'.repeat(60));
    console.log(`📝 其他字段 (${unknownFields.length}个):`);
    console.log('-'.repeat(60));
    for (const { key, value } of unknownFields) {
      console.log(`    ${key}=${value}`);
    }
  }

  // 输出精简版 Cookie
  console.log('\n' + '='.repeat(60));
  console.log('📝 精简版 Cookie（仅关键字段）:');
  console.log('='.repeat(60));

  const essentialKeys = [
    'uin', 'wxuin', 'wxunionid', 'psrf_qqunionid',
    'tmeLoginType', 'login_type',
    'qqmusic_key', 'qm_keyst',
    'psrf_qqaccess_token', 'psrf_qqopenid', 'psrf_qqrefresh_token',
    'wxaccess_token', 'wxopenid', 'wxrefresh_token',
    'psrf_access_token_expiresAt'
  ];

  const compactCookie = formatCookieOutput(parseCookie(cookieStr), essentialKeys);
  console.log(compactCookie);

  // 验证是否可用
  console.log('\n' + '='.repeat(60));
  console.log('🔍 可用性检测:');
  console.log('='.repeat(60));

  const hasAuthKey = found.has('qqmusic_key') || found.has('qm_keyst');
  const hasUserId = found.has('uin') || found.has('wxuin');
  const hasLoginType = found.has('wxunionid') || found.has('psrf_qqunionid');

  if (hasAuthKey && hasUserId && hasLoginType) {
    console.log('✅ Cookie 完整，应该可以正常使用！');
  } else {
    if (!hasAuthKey) console.log('❌ 缺少认证密钥 (qqmusic_key/qm_keyst)');
    if (!hasUserId) console.log('❌ 缺少用户ID (uin/wxuin)');
    if (!hasLoginType) console.log('❌ 缺少登录类型标识 (wxunionid/psrf_qqunionid)');
    console.log('\n⚠️  Cookie 不完整，可能无法获取高品质音频');
  }

  console.log('\n' + '='.repeat(60));
}

main();
