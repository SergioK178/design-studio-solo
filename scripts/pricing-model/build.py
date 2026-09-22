import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from calc import *
from gen import NAME, CUR, SUG, RT, CLASS, APPROVAL, public_term_weeks
from catalog_data import CAT, STEPS, EXT

ORDER = list(S.keys())
GROUP = {'start':'Сайты','landing':'Сайты','quiz':'Каталоги и продажи','company':'Сайты','catalog':'Каталоги и продажи','shop':'Каталоги и продажи',
 'wholesale':'Каталоги и продажи','migration':'Развитие','event':'Сайты','expert':'Сайты','booking':'Сайты','multi-landing':'Сайты','redesign':'Развитие',
 'tma':'Приложения','bot':'Автоматизация','app':'Приложения','web-service':'Приложения','leads-inbox':'Автоматизация','data-exchange':'Автоматизация',
 'documents':'Автоматизация','support':'Развитие'}
LV = {'L':'низкий','M':'средний','H':'высокий'}
LV2 = {'L':'low','M':'medium','H':'high'}
def mid(x): return (x[0]+x[1])/2
def f_h(x):
    g = lambda v: int(round(v/5)*5) if v >= 40 else int(round(v))
    a, b = g(x[0]), g(x[1])
    return f'{a}–{b}'
def kk(v): return f'{int(round(v)):,}'.replace(',', ' ')
def wk(x):
    r_ = lambda v: round(v*2)/2
    a, b = r_(x[0]), r_(x[1])
    if b <= a: b = a+0.5
    fm = lambda v: str(int(v)) if v == int(v) else str(v).replace('.', ',')
    return f'{fm(a)}–{fm(b)} нед.'

R = {}
for k in ORDER:
    v = out[k]
    exp = [v['ag'][j]*(1+0.5*(v['rv']+v['tc'])) for j in (0,1)]
    th = [v['plan'][0]/9, v['plan'][1]/9]
    lag = APPROVAL[CLASS[k]]
    safe = [0, 0] if k in ('start', 'support') else list(public_term_weeks(k))
    R[k] = dict(v, exp=exp, th=th, safe=safe, lag=lag)

COMMENT = {
 'start': 'Окупается только на готовом шаблонном ките (≈13–24 ч плановых). 49–59 тыс. даёт запас; вход в воронку и upsell.',
 'landing': 'Самый здоровый массовый SKU. Риск — нижняя граница при интеграциях: привязать цену к числу форм и интеграций.',
 'quiz': 'Экономика близка к лендингу. Держать границу «без ветвящейся логики».',
 'company': 'Нижняя граница легко продаёт большой объём контента. Привязать цену к числу страниц и готовности контента.',
 'catalog': 'Ключевой «средний» чек. Перенос данных считать отдельной строкой оценки.',
 'shop': 'Чувствителен к оплате/доставке. Нижняя граница — малый каталог, один провайдер оплаты и доставки.',
 'wholesale': 'Лучшее сочетание чека, повторяемости и делегируемости; общая база с каталогом.',
 'migration': 'Вёрстка сильно автоматизируется; риск — состояние контента и SEO. Цена от числа страниц.',
 'event': 'Срок задаёт дата события; оплату держать простой.',
 'expert': 'Зависит от контента клиента; цена — от числа материалов и кейсов.',
 'booking': 'Главный драйвер — правила расписания; нижняя граница — один тип ресурса.',
 'multi-landing': 'Хорошая экономика на общей базе блоков; цена от числа страниц (3–5).',
 'redesign': 'Высокий scope-creep, каждый проект уникален. Рассмотреть платный разбор как первый этап.',
 'tma': 'По объёму близок к booking/catalog; цена — от числа сценариев.',
 'bot': 'Хорошо автоматизируется; 50 тыс. реалистичны только для простого сценария без интеграций.',
 'app': 'После сужения scope до includes ≈1,9–2,1 тыс. ₽/ч. Обследование — отдельный платный этап.',
 'web-service': 'Один диапазон прячет два класса: «v1 одной ключевой цепочки» и «сложная система». Разделить.',
 'leads-inbox': 'Мало часов, но интеграции непредсказуемы; цена растёт с числом источников. Пересекается с «CRM-передачей».',
 'data-exchange': 'Худший ₽/ч в каталоге; зависит от чужих систем. Обследование — первым платным этапом.',
 'documents': 'Нормально при 2–3 шаблонах; далее рост почти линейный.',
 'support': 'Лучший ₽/ч и рекуррентность. Продавать пакетами по SLA, не по часам.',
}
def sug_txt(k):
    m, lo, hi, w = SUG[k]
    if k == 'start': return f'{lo}–{hi} тыс. фикс'
    if k == 'support': return f'{lo}–{hi} тыс./мес'
    return f'{lo}–{hi} тыс.'

T = {}
# T1 сводная
rows = ['| SKU | Текущая цена | Текущий срок | Manual, ч | Agent-assisted, ч (base → planned) | Безопасный срок | Scope risk | Repeatability (продажа / delivery) | Предлагаемая цена | Комментарий |',
        '|---|---|---|---|---|---|---|---|---|---|']
for k in ORDER:
    r = R[k]; rt = RT[k]
    term = '5–7 раб. дней' if k == 'start' else ('аудит ≈1 нед., далее ежемесячно' if k == 'support' else wk(r['safe']))
    if k == 'support': man = f"{r['man'][0]}–{r['man'][1]} /мес"; ag = f"{f_h(r['ag'])} → {f_h(r['plan'])} /мес"
    else: man = f"{r['man'][0]}–{r['man'][1]}"; ag = f"{f_h(r['ag'])} → {f_h(r['plan'])}"
    rows.append(f"| {NAME[k]} (`{k}`) | {CUR[k][0]} | {CUR[k][1]} | {man} | {ag} | {term} | {LV[rt[2]]} | {LV2[rt[0]]} / {LV2[rt[1]]} | {sug_txt(k)} | {COMMENT[k]} |")
T['T1'] = '\n'.join(rows)

# T4 effort: manual / agent / noncomp / automation / x / buffers / planned / mature
rows = ['| SKU | Manual | Agent base | Из них non-compressible | Automation potential | Ускорение (blended) | Буфер: правки/коммуникация | Буфер: тех. неопределённость | Planned (base + буферы) | Mature pipeline (planned) |',
        '|---|---|---|---|---|---|---|---|---|---|']
for k in ORDER:
    r = R[k]
    x = (r['man'][0]/r['ag'][0] + r['man'][1]/r['ag'][1])/2
    rows.append(f"| `{k}` | {r['man'][0]}–{r['man'][1]} | {f_h(r['ag'])} | {f_h(r['nc'])} | {RT[k][5]} | {x:.1f}× | +{int(r['rv']*100)}% | +{int(r['tc']*100)}% | **{f_h(r['plan'])}** | {f_h(r['matplan'])} |")
T['T4'] = '\n'.join(rows) + '\n\nЧасы у `support` — за один месяц.'

# T5 economics
rows = ['| SKU | Planned, ч | Стоимость труда @2 000 / @3 000 / @5 000 (тыс. ₽, low–high) | Цена (текущая) | Покрытие: min-цена ÷ cost(low), max-цена ÷ cost(high) — @2k | @3k | @5k | ₽ на planned-час (min / max) |',
        '|---|---|---|---|---|---|---|---|']
def cov(k, rate):
    p = PRICE[k]; pl = R[k]['plan']
    return f"{p[0]*1000/(pl[0]*rate):.1f}× / {p[1]*1000/(pl[1]*rate):.1f}×"
for k in ORDER:
    pl = R[k]['plan']; p = PRICE[k]
    cs = ' / '.join(f"{kk(pl[0]*r_/1000)}–{kk(pl[1]*r_/1000)}" for r_ in (2000, 3000, 5000))
    rev = f"{p[0]*1000/pl[0]/1000:.1f} / {p[1]*1000/pl[1]/1000:.1f} тыс." if p[0] != p[1] else f"{p[0]/pl[1]:.1f}–{p[0]/pl[0]:.1f} тыс."
    rows.append(f"| `{k}` | {f_h(pl)} | {cs} | {CUR[k][0]} | {cov(k,2000)} | {cov(k,3000)} | {cov(k,5000)} | {rev} |")
T['T5'] = '\n'.join(rows)

# T6 calendar
rows = ['| SKU | Технический production (раб. дни, ~1,5 чел.-экв.) | Ожидания клиента (раб. дни) | Безопасный срок | Текущий срок | Оценка текущего срока |',
        '|---|---|---|---|---|---|']
VERD = {
 'start':'на грани: 5 дней реальны только при полном контенте и ответе ≤1 дня', 'landing':'агрессивный', 'quiz':'агрессивный', 'company':'агрессивный',
 'catalog':'агрессивный', 'shop':'слишком агрессивный', 'wholesale':'агрессивный', 'migration':'нижняя граница агрессивна', 'event':'агрессивный',
 'expert':'агрессивный', 'booking':'агрессивный', 'multi-landing':'агрессивный', 'redesign':'агрессивный', 'tma':'агрессивный', 'bot':'на грани',
 'app':'нижняя граница агрессивна без обследования', 'web-service':'нижняя граница агрессивна без обследования', 'leads-inbox':'верхняя граница на грани',
 'data-exchange':'«по задаче» — ок, но нужен срок обследования', 'documents':'на грани', 'support':'—'}
for k in ORDER:
    r = R[k]
    term = '5–7 раб. дней' if k == 'start' else ('—' if k == 'support' else wk(r['safe']))
    tech = f"{r['th'][0]:.0f}–{r['th'][1]:.0f}" if k != 'support' else '≈1–2 в месяц'
    lag = f"{r['lag'][0]}–{r['lag'][1]}" if k != 'support' else '—'
    rows.append(f"| `{k}` | {tech} | {lag} | {term} | {CUR[k][1]} | {VERD[k]} |")
T['T6'] = '\n'.join(rows)

# T7 prices
SCOPE_DRV = {
 'start': 'фикс; каждый выход за типовую структуру — доп. строка',
 'landing': 'число форм и интеграций; кастомный блок; готовность контента',
 'quiz': 'число вопросов/веток; результат и передача заявки',
 'company': 'число страниц (5 / 8 / 10); готовность контента; своя иллюстрация',
 'catalog': 'число позиций и чистота данных; фильтры; перенос — отдельно',
 'shop': 'число позиций/вариантов; провайдер оплаты; способы доставки; данные',
 'wholesale': 'правила показа цен по типам покупателя; объём данных',
 'migration': 'число страниц; состояние контента; редиректы/SEO',
 'event': 'оплата или только заявка; напоминания; сроки события',
 'expert': 'число материалов и кейсов; запись на консультацию',
 'booking': 'число услуг/сотрудников; правила расписания; уведомления',
 'multi-landing': 'число посадочных (3–5); различия между ними',
 'redesign': 'число ключевых страниц; размер существующего контента',
 'tma': 'число сценариев/экранов; связь с ботом; оплата — отдельно',
 'bot': 'число сценариев; интеграции — отдельно',
 'app': 'число ролей и типов документов; уведомления; права; интеграции — отдельно',
 'web-service': 'v1 = одна ключевая цепочка, 2–3 роли; всё шире — индивидуальная оценка',
 'leads-inbox': 'число источников; правила маршрутизации',
 'data-exchange': 'число сущностей (каталог/остатки/заказы); направление; качество данных',
 'documents': 'число шаблонов (2–3 базово); источники данных',
 'support': 'пакеты по SLA/реакции и составу работ',
}
rows = ['| SKU | Текущая цена | Minimum viable | Target range | Ниже — неинтересно | ₽/planned-ч на min (low-scope) | ₽/planned-ч на target-high (high-scope) | Что должно двигать цену |',
        '|---|---|---|---|---|---|---|---|']
for k in ORDER:
    m, lo, hi, w = SUG[k]; pl = R[k]['plan']
    if k == 'support':
        a, b = f"{m/pl[0]:.1f} тыс.", f"{hi/pl[1]:.1f} тыс."
    elif k == 'start':
        a, b = f"{m/pl[1]:.1f}–{m/pl[0]:.1f} тыс.", '—'
    else:
        a, b = f"{m/pl[0]:.1f} тыс.", f"{hi/pl[1]:.1f} тыс."
    unit = ' /мес' if k == 'support' else ''
    rows.append(f"| `{k}` | {CUR[k][0]} | {m} тыс.{unit} | {sug_txt(k)} | < {w} тыс.{unit} | {a} | {b} | {SCOPE_DRV[k]} |")
T['T7'] = '\n'.join(rows)

# T8 repeatability
rows = ['| SKU | Продажа | Delivery | Scope creep | Делегируемость | Маржа (при текущей цене) | Automation | Переиспользуемая часть (оценка) | Стандартизируемость |',
        '|---|---|---|---|---|---|---|---|---|']
STD = {'start':'очень высокая','landing':'высокая','quiz':'высокая','company':'средняя','catalog':'средняя','shop':'средняя','wholesale':'высокая',
       'migration':'высокая','event':'высокая','expert':'средняя','booking':'средняя','multi-landing':'высокая','redesign':'низкая','tma':'средняя',
       'bot':'высокая','app':'низкая','web-service':'низкая','leads-inbox':'средняя','data-exchange':'низкая','documents':'средняя','support':'высокая'}
for k in ORDER:
    rt = RT[k]
    rows.append(f"| `{k}` | {LV2[rt[0]]} | {LV2[rt[1]]} | {LV2[rt[2]]} | {LV2[rt[3]]} | {LV2[rt[4]]} | {rt[5]} | ~{rt[6]}% / уникально ~{100-rt[6]}% | {STD[k]} |")
T['T8'] = '\n'.join(rows)

# T9: rev per human hour, ранжирование по текущим ценам (коррелированные концы) и по target
rk = []
for k in ORDER:
    pl = R[k]['plan']; p = PRICE[k]; ex = R[k]['exp']
    if k in ('start',):
        lo_r, hi_r = p[0]*1000/pl[1], p[0]*1000/pl[0]
    else:
        lo_r, hi_r = p[0]*1000/pl[0], p[1]*1000/pl[1]
    rk.append((k, lo_r, hi_r, mid([lo_r, hi_r]), SUG[k][1]))
rk.sort(key=lambda t: -t[3])
rows = ['| # | SKU | ₽/planned-ч (min-конец / max-конец, текущая цена) | Средний чек по target (нижняя граница) | Reuse | Делегируемость | Продажа |',
        '|---|---|---|---|---|---|---|']
for i, (k, a, b, m_, tl) in enumerate(rk, 1):
    unit = ' /мес' if k == 'support' else ''
    rows.append(f"| {i} | `{k}` | {a/1000:.1f} / {b/1000:.1f} тыс. | от {tl} тыс.{unit} | ~{RT[k][6]}% | {LV2[RT[k][3]]} | {LV2[RT[k][0]]} |")
T['T9'] = '\n'.join(rows)


# T10: сценарии conservative vs mature на текущих и предлагаемых ценах
rows = ['| SKU | Planned, ч (сейчас) | ₽/ч на текущей цене (min / max) | Planned, ч (mature) | ₽/ч на текущей цене (min / max) | ₽/ч на target (min-конец / max-конец), сейчас | то же, mature |', '|---|---|---|---|---|---|---|']
for k in ORDER:
    pl = R[k]['plan']; mp = R[k]['matplan']; p = PRICE[k]; m_, tl, th_, w = SUG[k]
    if k == 'start':
        a1 = f"{p[0]/pl[1]:.1f}–{p[0]/pl[0]:.1f}"; a2 = f"{p[0]/mp[1]:.1f}–{p[0]/mp[0]:.1f}"
        t1 = f"{tl/pl[1]:.1f}–{tl/pl[0]:.1f}"; t2 = f"{tl/mp[1]:.1f}–{tl/mp[0]:.1f}"
    else:
        a1 = f"{p[0]/pl[0]:.1f} / {p[1]/pl[1]:.1f}"; a2 = f"{p[0]/mp[0]:.1f} / {p[1]/mp[1]:.1f}"
        t1 = f"{tl/pl[0]:.1f} / {th_/pl[1]:.1f}"; t2 = f"{tl/mp[0]:.1f} / {th_/mp[1]:.1f}"
    rows.append(f"| `{k}` | {f_h(pl)} | {a1} | {f_h(mp)} | {a2} | {t1} | {t2} |")
T['T10'] = '\n'.join(rows) + '\n\nЗначения в тыс. ₽ за планируемый человеко-час (base + полные буферы).'


# T0: pricing v1 (решение владельца) против модели
V1 = {'start':(49,49,'5–7 раб. дней'),'landing':(100,200,'2–3 нед.'),'quiz':(120,190,'2–3 нед.'),'company':(220,450,'4–6 нед.'),
 'catalog':(300,650,'5–8 нед.'),'shop':(450,900,'8–12 нед.'),'wholesale':(300,600,'5–8 нед.'),'migration':(100,250,'2–4 нед.'),
 'event':(110,220,'2–3 нед.'),'expert':(150,350,'3–5 нед.'),'booking':(240,480,'4–6 нед.'),'multi-landing':(200,400,'3–5 нед.'),
 'redesign':(180,400,'4–6 нед.'),'tma':(220,450,'4–6 нед.'),'bot':(90,240,'2–4 нед.'),'app':(650,1300,'8–14 нед.'),
 'web-service':(800,1700,'10–16 нед.'),'leads-inbox':(80,190,'2–3 нед.'),'data-exchange':(180,480,'3–6 нед. после обследования'),
 'documents':(120,300,'2–4 нед.'),'support':(40,120,'постоянно / SLA')}  # v2 (pricing-аудит, раздел 2/4)
def fmtp(k):
    lo, hi, _ = V1[k]
    g = lambda v: f"{v:,}".replace(',', '\u00a0')
    if k == 'start': return '49\u00a0000 ₽ фикс'
    if k == 'support': return f"{lo}–{hi} тыс. ₽/мес"
    return f"{g(lo)}–{g(hi)} тыс. ₽" if hi >= 1000 else f"{lo}–{hi} тыс. ₽"
def cmp_price(k):
    lo, hi, _ = V1[k]; m_, tl, th_, w = SUG[k]
    notes = []
    if lo < m_: notes.append('ниже minimum viable')
    if hi > th_: notes.append(f'верх выше target-high ({th_})')
    return '; '.join(notes) if notes else 'в коридоре модели'
def cmp_term(k):
    if k in ('start', 'support'): return 'совпадает' if k == 'start' else '—'
    lo_, hi_ = R[k]['safe']; import re as _re
    nums = [int(x) for x in _re.findall(r'\d+', V1[k][2])[:2]]
    gap = round(hi_*2)/2 - nums[1]
    if k == 'data-exchange': return f"после обследования; модель {wk(R[k]['safe'])} с обследованием"
    if gap <= 0: return 'не короче безопасного'
    return f"короче безопасного верха на {str(gap).replace('.', ',')} нед. (модель {wk(R[k]['safe'])})"
rows = ['| SKU | Цена v1 | Срок v1 | ₽/planned-ч (min-конец / max-конец), сейчас | mature | Цена vs модель (раздел 6) | Срок vs безопасный (раздел 7) |', '|---|---|---|---|---|---|---|']
for k in ORDER:
    lo, hi, term = V1[k]; pl = R[k]['plan']; mp = R[k]['matplan']
    if k == 'start':
        a = f"{lo/pl[1]:.1f}–{lo/pl[0]:.1f}"; c = f"{lo/mp[1]:.1f}–{lo/mp[0]:.1f}"
    else:
        a = f"{lo/pl[0]:.1f} / {hi/pl[1]:.1f}"; c = f"{lo/mp[0]:.1f} / {hi/mp[1]:.1f}"
    rows.append(f"| {NAME[k]} (`{k}`) | {fmtp(k)} | {term} | {a} | {c} | {cmp_price(k)} | {cmp_term(k)} |")
T['T0'] = '\n'.join(rows) + '\n\nЗначения ₽/ч — тыс. ₽ за планируемый человеко-час (base + полные буферы).'

# Приложение A: scope каталога
rows = ['| SKU | Группа | Статус | Входит | Не входит | Ограничения / шаги | Опции (recommendedExtensions) | CTA |', '|---|---|---|---|---|---|---|---|']
for k in ORDER:
    st, inc, exc, note, ext, status, cta = CAT[k]
    steps = STEPS.get(st, '')
    note_full = note if st == 'своя цепочка' else f"{note}. Шаги ({st}): {steps}"
    rows.append(f"| `{k}` | {GROUP[k]} | {status} | {inc} | {exc} | {note_full} | {ext} | {cta} |")
T['A'] = '\n'.join(rows)
rows = ['| id | Опция | Цена | Срок |', '|---|---|---|---|'] + [f"| `{a}` | {b} | {c} | {d} |" for a, b, c, d in EXT]
T['A2'] = '\n'.join(rows)

# Приложение B: manual по этапам
HDR = 'D discovery | S структура/UX | G дизайн | F frontend | B backend | I интеграции | C контент/данные | Q QA | P deploy | R правки/коммуникация | M PM'.split(' | ')
rows = ['| SKU | ' + ' | '.join(HDR) + ' | Σ |', '|---|' + '---|'*12]
for k in ORDER:
    st = R[k]['stages']
    cells = [(f"{a}–{b}" if (a, b) != (0, 0) else '0') for a, b in st]
    rows.append(f"| `{k}` | " + ' | '.join(cells) + f" | **{R[k]['man'][0]}–{R[k]['man'][1]}** |")
T['B'] = '\n'.join(rows)

# Приложение C: роли (agent-assisted base, mid)
role = {'PM / product / коммуникация':'DRM', 'Дизайн':'SG', 'Frontend + контент/данные':'FC', 'Backend / интеграции':'BI', 'QA / деплой':'QP'}
rows = ['| SKU | ' + ' | '.join(role.keys()) + ' | Σ (mid) |', '|---|---|---|---|---|---|---|']
for k in ORDER:
    v = R[k]
    vals = [sum(mid(v['ag_st'][s]) for s in ss) for ss in role.values()]
    rows.append(f"| `{k}` | " + ' | '.join(f"{x:.0f}" for x in vals) + f" | {sum(vals):.0f} |")
T['C'] = '\n'.join(rows)

# Приложение D: факторы этапов
NAMEST = dict(zip(STAGES, HDR))
COMPR = dict(D='низкая/средняя', S='средняя', G='средняя', F='очень высокая', B='высокая/средняя', I='средняя (непредсказуемо)', C='средняя/высокая (ожидание клиента не сжимается)', Q='средняя (ответственность остаётся)', P='средняя/высокая', R='почти нет', M='низкая')
rows = ['| Этап | Автоматизируемость | Остаётся человеческого времени: сейчас (conservative) | Остаётся: mature pipeline |', '|---|---|---|---|']
for s in STAGES:
    rows.append(f"| {NAMEST[s]} | {COMPR[s]} | {int(BASE[s]*100)}% (≈{1/BASE[s]:.1f}×) | {int(MATURE[s]*100)}% (≈{1/MATURE[s]:.1f}×) |")
T['D'] = '\n'.join(rows)

# blended stats
xs = [(R[k]['man'][0]/R[k]['ag'][0] + R[k]['man'][1]/R[k]['ag'][1])/2 for k in ORDER]
mxs = [(R[k]['man'][0]/R[k]['mat'][0] + R[k]['man'][1]/R[k]['mat'][1])/2 for k in ORDER]
T['XMIN'] = f"{min(xs):.1f}"; T['XMAX'] = f"{max(xs):.1f}"; T['MMIN'] = f"{min(mxs):.1f}"; T['MMAX'] = f"{max(mxs):.1f}"

tmpl = open(os.path.join(HERE, 'template.md'), encoding='utf-8').read()
for key, val in T.items():
    tmpl = tmpl.replace(f'@@{key}@@', val)
left = re.findall(r'@@\w+@@', tmpl)
assert not left, left
open(os.path.join(HERE, '..', '..', 'PRICING_REVIEW.md'), 'w', encoding='utf-8').write(tmpl)
print('ok', len(tmpl))
