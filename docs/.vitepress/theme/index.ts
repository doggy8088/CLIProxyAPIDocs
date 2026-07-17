import DefaultTheme from 'vitepress/theme'
import { inBrowser, type Theme } from 'vitepress'
import {
	LANGUAGE_PREFERENCE_KEY,
	detectPreferredLocale,
	getLocaleFromPathname,
	getLocalePath,
	isSiteRoot,
	isSupportedLocale,
	type SupportedLocale,
} from './language'

function readLanguagePreference(): SupportedLocale | null {
	try {
		const preference = window.localStorage.getItem(LANGUAGE_PREFERENCE_KEY)
		return isSupportedLocale(preference) ? preference : null
	} catch {
		return null
	}
}

function writeLanguagePreference(locale: SupportedLocale): void {
	try {
		window.localStorage.setItem(LANGUAGE_PREFERENCE_KEY, locale)
	} catch {
		// 瀏覽器禁止使用 localStorage 時，仍可在目前頁面正常切換語言。
	}
}

function rememberLanguageChoice(event: MouseEvent): void {
	if (!(event.target instanceof Element)) return

	const link = event.target.closest<HTMLAnchorElement>('a[href]')
	if (!link) return

	const target = new URL(link.href, window.location.href)
	if (target.origin !== window.location.origin) return

	writeLanguagePreference(getLocaleFromPathname(target.pathname))
}

function getBrowserLanguages(): string[] {
	if (navigator.languages.length > 0) return [...navigator.languages]
	return navigator.language ? [navigator.language] : []
}

const theme: Theme = {
	extends: DefaultTheme,
	enhanceApp() {
		if (!inBrowser) return

		document.addEventListener('click', rememberLanguageChoice, { capture: true })

		if (!isSiteRoot(window.location.pathname)) return

		const locale = readLanguagePreference() ?? detectPreferredLocale(getBrowserLanguages())
		const localePath = getLocalePath(locale)
		if (localePath === '/') return

		const target = new URL(localePath, window.location.origin)
		target.search = window.location.search
		target.hash = window.location.hash
		window.location.replace(target.href)
	},
}

export default theme
