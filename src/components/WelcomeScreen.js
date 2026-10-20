import { t, getLang, setLang } from '../lib/i18n.js';

const CARDS = [
    {
        title: 'welcome.modelsTitle',
        body: 'welcome.modelsBody',
        icon: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.8"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8"/>'
    },
    {
        title: 'welcome.mediaTitle',
        body: 'welcome.mediaBody',
        icon: '<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M3 9.5h18M8 4.5v15M16 4.5v15"/>'
    },
    {
        title: 'welcome.flowTitle',
        body: 'welcome.flowBody',
        icon: '<circle cx="5.5" cy="6" r="2.5"/><circle cx="18.5" cy="6" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/><path d="M8 6h8M18.5 8.5v7M16.2 16.1l2.3 1.9 2.3-1.9"/>'
    },
    {
        title: 'welcome.keyTitle',
        body: 'welcome.keyBody',
        icon: '<circle cx="8" cy="15" r="4.5"/><path d="M11.3 11.7L20 3M16.8 6.2l2.2 2.2M14.2 8.8l2.2 2.2"/>'
    }
];

export function WelcomeScreen(onEnter) {
    const root = document.createElement('div');
    root.className = 'fixed inset-0 z-[200] bg-app-bg overflow-y-auto';

    root.innerHTML = `
        <div class="pointer-events-none absolute -top-40 left-1/2 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]"></div>
        <div class="pointer-events-none absolute -bottom-52 -right-40 h-[540px] w-[540px] rounded-full bg-[#087F91]/15 blur-[130px]"></div>
        <div class="relative flex min-h-full w-full items-center justify-center px-6 py-12 sm:px-10">
            <div class="flex w-full max-w-5xl flex-col items-center text-center">
                <svg class="h-16 w-auto animate-fade-in-up sm:h-20 md:h-24" viewBox="100 40 300 340" role="img" aria-label="Sceneviz" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="sv-welcome-cyan" x1="0" y1="0" x2="1" y2="1">
                            <stop stop-color="#67F4F2"/>
                            <stop offset=".55" stop-color="#16C5D0"/>
                            <stop offset="1" stop-color="#087F91"/>
                        </linearGradient>
                        <linearGradient id="sv-welcome-amber" x1="0" y1="0" x2="1" y2="1">
                            <stop stop-color="#FFE0A0"/>
                            <stop offset=".55" stop-color="#F2AE43"/>
                            <stop offset="1" stop-color="#B96B18"/>
                        </linearGradient>
                    </defs>
                    <g stroke-linejoin="round" style="filter: drop-shadow(0 1px 1.5px rgba(7, 93, 106, 0.45));">
                        <path d="M104 130 L358 48 L358 145 L196 204 L358 268 L358 368 L104 277 L104 213 L260 267 L260 228 L104 167 Z" fill="url(#sv-welcome-cyan)" stroke="#9AFBFA" stroke-width="5"/>
                        <path d="M104 130 L196 204 L260 228 L260 267 L196 243 L104 277 L104 213 L172 190 Z" fill="url(#sv-welcome-amber)" stroke="#FFE0A0" stroke-width="5"/>
                        <path d="M358 268 L260 228 L260 267 L358 309 Z" fill="#075D6A"/>
                    </g>
                </svg>
                <div class="mt-7 inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary" style="animation-delay:.06s;">
                    ${t('welcome.badge')}
                </div>
                <h1 class="font-display mt-5 animate-fade-in-up text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl" style="animation-delay:.12s;">
                    ${t('welcome.wordmark')}
                </h1>
                <p class="mt-3 max-w-xl animate-fade-in-up text-sm font-medium text-secondary sm:text-base" style="animation-delay:.18s;">
                    ${t('welcome.tagline')}
                </p>
                <div id="welcome-cards" class="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"></div>
                <div class="mt-10 flex animate-fade-in-up flex-col items-center gap-3" style="animation-delay:.42s;">
                    <button id="welcome-enter" type="button" class="inline-flex items-center gap-3 rounded-2xl bg-primary px-9 py-4 text-base font-bold text-black shadow-glow transition-all hover:scale-[1.02] hover:bg-primary-hover active:scale-[0.98]">
                        <span>${t('welcome.cta')}</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12h14M13 6l6 6-6 6"/>
                        </svg>
                    </button>
                </div>
                <p class="mt-8 animate-fade-in-up text-[11px] font-medium text-muted" style="animation-delay:.5s;">
                    ${t('welcome.footer')}
                </p>
            </div>
        </div>
    `;

    const cardsWrap = root.querySelector('#welcome-cards');
    CARDS.forEach((card, idx) => {
        const el = document.createElement('div');
        el.className = 'animate-fade-in-up rounded-2xl border border-white/10 bg-panel-bg/70 p-5 text-left backdrop-blur';
        el.style.animationDelay = `${0.24 + idx * 0.06}s`;
        el.innerHTML = `
            <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${card.icon}</svg>
            </div>
            <div class="font-display mt-4 text-base font-bold text-white">${t(card.title)}</div>
            <div class="mt-1.5 text-[13px] leading-relaxed text-secondary">${t(card.body)}</div>
        `;
        cardsWrap.appendChild(el);
    });

    const currentLang = getLang();
    const langBtn = document.createElement('button');
    langBtn.type = 'button';
    langBtn.className = 'fixed right-5 top-5 z-[210] flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] font-bold text-white/80 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white';
    langBtn.textContent = currentLang === 'zh-CN' ? 'EN' : '中文';
    langBtn.title = currentLang === 'zh-CN' ? t('web.switchToEn') : t('web.switchToZh');
    langBtn.onclick = () => setLang(currentLang === 'zh-CN' ? 'en' : 'zh-CN');
    root.appendChild(langBtn);

    let entered = false;
    const enter = () => {
        if (entered) return;
        entered = true;
        document.removeEventListener('keydown', onKeydown);
        try {
            localStorage.setItem('sceneviz.welcome.dismissed', '1');
        } catch (err) {
        }
        if (root.parentNode) root.parentNode.removeChild(root);
        if (onEnter) onEnter();
    };

    function onKeydown(e) {
        if (e.key === 'Enter') enter();
    }

    root.querySelector('#welcome-enter').onclick = enter;
    document.addEventListener('keydown', onKeydown);

    return root;
}
