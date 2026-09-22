import json, math

STAGES = ['D','S','G','F','B','I','C','Q','P','R','M']
# доля человеческого времени, остающаяся при зрелом agent-assisted workflow
BASE = dict(D=.70,S=.60,G=.50,F=.25,B=.35,I=.55,C=.45,Q=.50,P=.40,R=.85,M=.80)

# manual baseline: [lo,hi] по этапам D S G F B I C Q P R M
S = {
 'start': [(2,3),(1,2),(4,8),(8,12),(1,2),(1,2),(2,4),(2,3),(1,2),(2,4),(1,2)],
 'landing': [(3,5),(3,5),(8,18),(12,20),(2,5),(4,10),(4,8),(3,5),(2,3),(5,8),(2,4)],
 'quiz': [(3,5),(3,5),(10,16),(14,24),(3,6),(4,8),(3,6),(4,7),(2,3),(5,8),(2,4)],
 'company': [(6,10),(8,14),(24,50),(24,50),(3,8),(3,8),(10,30),(8,14),(3,5),(10,20),(6,11)],
 'catalog':      [(8,14),(8,14),(20,40),(30,60),(24,60),(6,16),(16,50),(12,24),(6,12),(14,28),(10,20)],
 'shop': [(8,16),(8,16),(25,50),(38,70),(41,90),(17,40),(13,40),(17,36),(6,12),(19,36),(13,24)],
 'wholesale':    [(7,15),(7,15),(20,40),(30,60),(25,55),(5,14),(16,50),(12,22),(6,12),(12,27),(10,20)],
 'migration': [(4,10),(2,6),(2,8),(16,50),(0,6),(2,8),(6,24),(6,14),(3,6),(5,12),(3,7)],
 'event': [(3,6),(3,6),(10,22),(14,28),(6,16),(6,16),(4,10),(5,10),(2,4),(5,9),(2,5)],
 'expert': [(4,8),(4,10),(16,40),(16,40),(3,10),(3,8),(10,30),(6,12),(2,5),(8,16),(4,9)],
 'booking': [(6,10),(6,10),(16,31),(22,46),(24,52),(4,13),(6,15),(10,21),(3,6),(10,21),(8,15)],
 'multi-landing': [(6,10),(6,12),(20,40),(24,50),(3,8),(4,10),(8,20),(8,16),(3,5),(9,18),(5,10)],
 'redesign': [(4,8),(6,12),(18,40),(18,44),(0,6),(2,6),(8,20),(6,12),(2,5),(12,22),(6,12)],
 'tma': [(4,8),(4,8),(13,27),(25,50),(19,42),(6,15),(3,8),(8,19),(4,8),(8,17),(6,13)],
 'bot': [(3,8),(2,6),(0,4),(0,0),(16,44),(4,14),(3,8),(6,14),(3,6),(4,10),(2,6)],
 'app': [(13,25),(10,19),(19,39),(32,71),(50,110),(6,24),(6,19),(19,39),(6,13),(16,34),(13,27)],
 'web-service': [(18,32),(14,26),(20,36),(44,80),(72,150),(8,40),(4,16),(24,48),(6,12),(16,40),(16,40)],
 'leads-inbox': [(2,6),(1,3),(0,0),(0,1),(6,18),(8,24),(1,4),(3,8),(2,4),(2,5),(2,4)],
 'data-exchange': [(6,14),(3,6),(0,0),(0,1),(14,40),(16,48),(4,20),(8,20),(3,6),(4,12),(4,10)],
 'documents': [(4,10),(2,5),(2,8),(0,4),(14,40),(6,20),(6,20),(6,14),(2,5),(3,8),(2,5)],
 'support':      [(0,2),(0,0),(0,3),(4,12),(0,4),(0,1),(1,3),(1,3),(1,2),(2,4),(1,2)],
}
MATURE = dict(D=.60,S=.45,G=.30,F=.12,B=.18,I=.35,C=.30,Q=.35,P=.20,R=.75,M=.65)
MOVR = {'app':dict(D=.7,R=.85,M=.75,I=.45),'web-service':dict(D=.7,R=.85,M=.75,I=.45),'data-exchange':dict(I=.5,B=.25),'leads-inbox':dict(I=.45),'shop':dict(I=.45)}
OVR = {
 'start': dict(F=.20,G=.40,S=.5),
 'migration': dict(F=.20,C=.35),
 'data-exchange': dict(B=.45,I=.70), 'leads-inbox': dict(B=.45,I=.70), 'documents': dict(B=.45,I=.70),
 'web-service': dict(B=.40,I=.65,D=.80,S=.70,R=.90,M=.85),
 'app': dict(B=.40,I=.65,D=.80,S=.70,R=.90,M=.85),
 'shop': dict(B=.40,I=.65),
 'bot': dict(B=.30,I=.60),
 'support': dict(F=.30,R=.90),
}
# буфер: (revision/communication, technical uncertainty)
BUF = {
 'start':(.15,.05),'landing':(.15,.08),'quiz':(.15,.10),'company':(.20,.08),'catalog':(.15,.15),
 'shop':(.18,.22),'wholesale':(.15,.12),'migration':(.15,.20),'event':(.15,.10),'expert':(.20,.08),
 'booking':(.18,.18),'multi-landing':(.18,.10),'redesign':(.22,.18),'tma':(.18,.20),'bot':(.15,.18),
 'app':(.20,.25),'web-service':(.20,.25),'leads-inbox':(.12,.22),'data-exchange':(.15,.35),
 'documents':(.15,.18),'support':(.10,.10),
}
# текущая публичная цена v2, тыс. ₽ (min,max); support — за месяц. Canonical source: site/src/data/products.ts (publicPricing)
PRICE = {
 'start':(49,49),'landing':(100,200),'quiz':(120,190),'company':(220,450),'catalog':(300,650),'shop':(450,900),
 'wholesale':(300,600),'migration':(100,250),'event':(110,220),'expert':(150,350),'booking':(240,480),
 'multi-landing':(200,400),'redesign':(180,400),'tma':(220,450),'bot':(90,240),'app':(650,1300),
 'web-service':(800,1700),'leads-inbox':(80,190),'data-exchange':(180,480),'documents':(120,300),'support':(40,120),
}

def r(x):  # округление до 5 для больших, до 1 для малых
    return int(round(x/5.0)*5) if x>=40 else int(round(x))

out = {}
for k, st in S.items():
    f = dict(BASE); f.update(OVR.get(k, {}))
    man = [sum(a for a,b in st), sum(b for a,b in st)]
    ag_st = {s:(st[i][0]*f[s], st[i][1]*f[s]) for i,s in enumerate(STAGES)}
    ag = [sum(v[0] for v in ag_st.values()), sum(v[1] for v in ag_st.values())]
    nc = [sum(ag_st[s][j] for s in 'DRMQ') for j in (0,1)]
    rv, tc = BUF[k]
    plan = [ag[0]*(1+rv+tc), ag[1]*(1+rv+tc)]
    fm = dict(MATURE); fm.update(MOVR.get(k,{}))
    mat = [sum(st[i][j]*fm[x] for i,x in enumerate(STAGES)) for j in (0,1)]
    matplan = [mat[0]*(1+rv+tc), mat[1]*(1+rv+tc)]
    out[k] = dict(mat=mat, matplan=matplan, man=man, ag=ag, nc=nc, plan=plan, rv=rv, tc=tc, ratio=(man[0]/ag[0], man[1]/ag[1]),
                  stages=st, ag_st=ag_st)

if __name__ == '__main__':
    print(f"{'sku':14} {'manual':>10} {'agent':>10} {'noncomp':>9} {'buf%':>5} {'planned':>11} {'x':>5} | price  | mid/h(plan-mid) | min/planhi  | cost3k(plan mid) | techdays")
    for k,v in out.items():
        pl = v['plan']; mid=(pl[0]+pl[1])/2
        p = PRICE[k]; pm=(p[0]+p[1])/2
        print(f"{k:14} {v['man'][0]:>4}-{v['man'][1]:<5} {r(v['ag'][0]):>4}-{r(v['ag'][1]):<5} {r(v['nc'][0]):>3}-{r(v['nc'][1]):<4} {int((v['rv']+v['tc'])*100):>4} {r(pl[0]):>5}-{r(pl[1]):<5} {v['man'][0]/v['ag'][0]:.1f}-{v['man'][1]/v['ag'][1]:.1f} | {p[0]}-{p[1]} | {pm*1000/mid:7.0f} | {p[0]*1000/pl[1]:7.0f} | {mid*3:6.0f}k | {pl[0]/9:.0f}-{pl[1]/9:.0f}")
