import json, math, os
from calc import *
HERE = os.path.dirname(os.path.abspath(__file__))

NAME = {'start':'Промо-лендинг','landing':'Лендинг под рекламу','quiz':'Квиз-лендинг','company':'Корпоративный сайт',
 'catalog':'Каталог компании','shop':'Интернет-магазин','wholesale':'Оптовый каталог с КП','migration':'Переезд с конструктора',
 'event':'Лендинг мероприятия/курса','expert':'Сайт эксперта','booking':'Сайт с онлайн-записью','multi-landing':'Мультилендинг',
 'redesign':'Редизайн','tma':'Приложение в Telegram','bot':'Telegram-бот','app':'Личный кабинет','web-service':'Рабочий веб-сервис',
 'leads-inbox':'Заявки в одну систему','data-exchange':'Обмен данными между системами','documents':'Документы и отчёты','support':'Поддержка и развитие'}
CUR = {  # canonical public v2 (как в products.ts). Единственный источник изменений цены/срока: раздел 2/4 pricing-аудита.
 'start':('49 000 ₽ фикс','5–7 раб. дней'),'landing':('100–200 тыс.','2–3 нед.'),'quiz':('120–190 тыс.','2–3 нед.'),
 'company':('220–450 тыс.','4–6 нед.'),'catalog':('300–650 тыс.','5–8 нед.'),'shop':('450–900 тыс.','8–12 нед.'),
 'wholesale':('300–600 тыс.','5–8 нед.'),'migration':('100–250 тыс.','2–4 нед.'),'event':('110–220 тыс.','2–3 нед.'),
 'expert':('150–350 тыс.','3–5 нед.'),'booking':('240–480 тыс.','4–6 нед.'),'multi-landing':('200–400 тыс.','3–5 нед.'),
 'redesign':('180–400 тыс.','4–6 нед.'),'tma':('220–450 тыс.','4–6 нед.'),'bot':('90–240 тыс.','2–4 нед.'),
 'app':('650–1 300 тыс.','8–14 нед.'),'web-service':('800–1 700 тыс.','10–16 нед.'),'leads-inbox':('80–190 тыс.','2–3 нед.'),
 'data-exchange':('180–480 тыс.','3–6 нед. после обследования'),'documents':('120–300 тыс.','2–4 нед.'),'support':('40–120 тыс./мес','по договорённости')}
# (min viable, target lo, target hi, walk-away) тыс. ₽ — target lo/hi = принятая цена (PRICE); production-выведено, не отдельное решение
SUG = {}
for _k in S.keys():
    _lo, _hi = PRICE[_k]
    _m = int(round(_lo*0.9/5)*5) if _lo >= 40 else int(round(_lo*0.9))
    _w = int(round(_lo*0.75/5)*5) if _lo >= 40 else int(round(_lo*0.75))
    SUG[_k] = (_m, _lo, _hi, _w)
# ratings: sales, delivery, creep, delegation, margin(now), automation, reuse%
RT = {'start':('H','H','L','H','L','high',60),'landing':('H','H','M','H','M','high',55),'quiz':('M','H','M','H','M','high',60),
 'company':('H','M','H','M','M','high',40),'catalog':('M','M','M','M','M','high',50),'shop':('M','M','H','M','L','medium',35),
 'wholesale':('M','H','M','H','H','high',65),'migration':('M','H','M','H','H','very high',60),'event':('M','H','M','H','M','high',55),
 'expert':('M','M','H','M','M','high',40),'booking':('M','M','M','M','M','high',45),'multi-landing':('M','H','M','H','H','high',65),
 'redesign':('H','L','H','M','L','high',30),'tma':('M','M','M','M','M','high',45),'bot':('H','H','M','H','M','very high',60),
 'app':('L','L','H','L','L','medium',35),'web-service':('L','L','H','L','L','medium',30),'leads-inbox':('H','M','M','H','L','high',55),
 'data-exchange':('M','L','H','M','L','medium',30),'documents':('M','M','M','H','M','high',50),'support':('H','H','M','H','H','high',70)}
# Класс SKU (раздел B pricing-аудита) и нормальное время на согласования, раб. дни (раздел F)
CLASS = {'start':'A','landing':'B','quiz':'B','event':'B','expert':'B','multi-landing':'B','company':'B',
 'catalog':'C','wholesale':'C','shop':'C','booking':'C','tma':'C','bot':'C','leads-inbox':'C','documents':'C',
 'app':'D','web-service':'D',
 'migration':'E','redesign':'E','data-exchange':'E',
 'support':'F'}
APPROVAL = {'A':(2,3),'B':(4,10),'C':(6,14),'D':(12,18),'E':(4,10),'F':(0,0)}

def _ceil_half(x): return math.ceil(x*2)/2
def public_term_weeks(k):
    """v2: ceil_to_0.5нед(1.2 * (planned/45нед.-часов + нормальное_согласование/5)).
    Нижняя граница — от нижнего planned и нижнего согласования, не от midpoint.
    Худший случай ожидания клиента (LAG) в публичный срок не входит — это условие договора."""
    lo_days, hi_days = APPROVAL[CLASS[k]]
    pl = out[k]['plan']
    lo = _ceil_half(1.2*(pl[0]/45 + lo_days/5))
    hi = _ceil_half(1.2*(pl[1]/45 + hi_days/5))
    if hi <= lo: hi = lo + 0.5
    return (lo, hi)

def mid(x): return (x[0]+x[1])/2
rows = {}
for k,v in out.items():
    exp = [v['ag'][j]*(1+0.5*(v['rv']+v['tc'])) for j in (0,1)]
    role = {'PM/коммуникация':'DRM','Дизайн':'SG','Frontend + контент':'FC','Backend/интеграции':'BI','QA/деплой':'QP'}
    rl = {n: sum(mid(v['ag_st'][s]) for s in ss) for n,ss in role.items()}
    lag = APPROVAL[CLASS[k]]
    th = [v['plan'][0]/9, v['plan'][1]/9]
    safe = None if k in ('start','support') else public_term_weeks(k)
    rows[k] = dict(v, exp=exp, rl=rl, th=th, safe=safe, lag=lag)

def rng(a,b,step=1):
    f = lambda x: int(round(x/step)*step)
    return f'{f(a)}–{f(b)}'
def hh(x): return rng(x[0],x[1], 5 if x[1]>=60 else 1)
def kfmt(x): return f'{int(round(x)):,}'.replace(',', ' ')

L=[]
# --- summary
L.append('| SKU | Текущая цена | Текущий срок | Manual, ч | Agent-assisted, ч (base) | Плановый срок, клиенту (безопасно) | Scope risk | Repeat. (продажа/delivery) | Предлагаемая цена (target) | Комментарий |')
L.append('|---|---|---|---|---|---|---|---|---|---|')
COMMENT = {}  # заполняется вручную в шаблоне

def weeks_txt(k):
    if k=='start': return '5–7 раб. дней'
    if k=='support': return 'старт 1 нед. + ежемесячно'
    lo,hi = rows[k]['safe']
    f = lambda x: round(x*2)/2
    a,b = f(lo), f(hi)
    a = max(a,1); b=max(b,a+0.5) if b<=a else b
    fmt=lambda x: (str(int(x)) if x==int(x) else str(x).replace('.',','))
    return f'{fmt(a)}–{fmt(b)} нед.'
def sugg(k):
    m,lo,hi,w = SUG[k]
    if k=='start': return f'{lo}–{hi} тыс. фикс'
    if k=='support': return f'{lo}–{hi} тыс./мес'
    return f'{lo}–{hi} тыс.'
def fmtk(x): return kfmt(x)
def main():
    # save for template
    data = {}
    for k,r_ in rows.items():
        data[k] = dict(name=NAME[k], cur=CUR[k], man=r_['man'], ag=[r_['ag'][0],r_['ag'][1]], nc=r_['nc'], plan=r_['plan'], exp=r_['exp'],
                       rv=r_['rv'], tc=r_['tc'], ratio=(r_['man'][0]/r_['ag'][0], r_['man'][1]/r_['ag'][1]), th=r_['th'], safe=r_['safe'], rl=r_['rl'],
                       sug=SUG[k], rt=RT[k], price=PRICE[k], stages=r_['stages'], ag_st={s:list(x) for s,x in r_['ag_st'].items()})
    json.dump(data, open(os.path.join(HERE,'data.json'),'w'), ensure_ascii=False, indent=1)

    # print quick check table for judgement
    print(f"{'sku':14}{'manual':>10}{'agentBase':>11}{'expected':>10}{'x':>5} | rev/h@cur-mid(exp) | rev/h@sug-mid(exp) | rev/h@sug-mid(plan-mid) | safe wks | techwd")
    for k,r_ in rows.items():
        ex=mid(r_['exp']); pl=mid(r_['plan']); pm=mid(PRICE[k])*1000; sm=(SUG[k][1]+SUG[k][2])/2*1000
        print(f"{k:14}{r_['man'][0]:>4}-{r_['man'][1]:<5}{hh(r_['ag']):>11}{hh(r_['exp']):>10}{mid(r_['man'])/mid(r_['ag']):>5.1f} | {pm/ex:>12.0f} | {sm/ex:>12.0f} | {sm/pl:>12.0f} | {weeks_txt(k):>14} | {r_['th'][0]:.0f}-{r_['th'][1]:.0f}")


if __name__ == '__main__':
    main()
