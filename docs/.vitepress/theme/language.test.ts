import assert from 'node:assert/strict'
import test from 'node:test'
import {
	detectPreferredLocale,
	getLocaleFromPathname,
	getLocalePath,
	isSiteRoot,
	isSupportedLocale,
} from './language.ts'

test('任何中文語系都預設為正體中文', () => {
	for (const language of ['zh', 'zh-TW', 'zh-CN', 'zh-Hans', 'zh-Hant', 'zh-HK', 'zh_SG']) {
		assert.equal(detectPreferredLocale([language]), 'zh-TW')
	}
})

test('依瀏覽器偏好順序選擇支援的語言', () => {
	assert.equal(detectPreferredLocale(['ja-JP', 'en-US']), 'en')
	assert.equal(detectPreferredLocale(['fr-FR', 'ru-RU', 'en-US']), 'ru')
	assert.equal(detectPreferredLocale(['zh-CN', 'en-US']), 'zh-TW')
})

test('無法辨識或缺少語言時預設為正體中文', () => {
	assert.equal(detectPreferredLocale(['ja-JP']), 'zh-TW')
	assert.equal(detectPreferredLocale([]), 'zh-TW')
})

test('語系路徑與手動選擇可以正確解析', () => {
	assert.equal(getLocalePath('en'), '/')
	assert.equal(getLocalePath('ru'), '/ru/')
	assert.equal(getLocalePath('zh-CN'), '/cn/')
	assert.equal(getLocalePath('zh-TW'), '/zh-TW/')
	assert.equal(getLocaleFromPathname('/zh-TW/introduction/quick-start'), 'zh-TW')
	assert.equal(getLocaleFromPathname('/cn/introduction/quick-start'), 'zh-CN')
	assert.equal(getLocaleFromPathname('/ru/introduction/quick-start'), 'ru')
	assert.equal(getLocaleFromPathname('/introduction/quick-start'), 'en')
})

test('只在網站根目錄執行自動偵測', () => {
	assert.equal(isSiteRoot('/'), true)
	assert.equal(isSiteRoot('/index.html'), true)
	assert.equal(isSiteRoot('/zh-TW/'), false)
	assert.equal(isSupportedLocale('zh-TW'), true)
	assert.equal(isSupportedLocale('ja'), false)
})
