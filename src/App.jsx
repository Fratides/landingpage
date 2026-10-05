import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Calculator,
  ChevronRight,
  Factory,
  Menu,
  MessageCircle,
  MessageSquareText,
  PackageCheck,
  X,
  Wrench,
} from 'lucide-react'

const whatsappUrl = `https://wa.me/5532999733253?text=${encodeURIComponent('Olá! Quero conhecer o Syncro MOV e ver uma demonstração para minha fábrica.')}`

const featureCards = [
  {
    id: '01',
    icon: PackageCheck,
    title: 'Apontamento no ritmo da produção',
    description: 'O operador acompanha a peça atual e registra o andamento sem interromper o ciclo da máquina.',
    image: '/images/principal-operador.png',
    imageAlt: 'Painel do operador com a peça atual e o progresso da produção CNC',
    className: 'md:col-span-7',
  },
  {
    id: '02',
    icon: PackageCheck,
    title: 'Ordens e peças em contexto',
    description: 'Consulte peças e ordens de produção com as informações necessárias para cada etapa da fábrica.',
    image: '/images/ordens.png',
    imageAlt: 'Modal de peças e ordens de produção do sistema SYNCRO MOV',
    className: 'md:col-span-5',
  },
  {
    id: '03',
    icon: MessageSquareText,
    title: 'Fluxo de máquinas sem pontos cegos',
    description: 'Visualize o Kanban de produção e os status das células CNC em um painel compartilhado.',
    image: '/images/producao-maquinas-administrador.png',
    imageAlt: 'Kanban de máquinas CNC com status de ordens pendentes, em produção e concluídas',
    className: 'md:col-span-5',
  },
  {
    id: '04',
    icon: BarChart3,
    title: 'Relatórios que orientam decisões',
    description: 'Acompanhe os dados da produção do dia e identifique oportunidades para melhorar o fluxo.',
    image: '/images/producao-do-dia-administrador.png',
    imageAlt: 'Relatório administrativo da produção CNC do dia',
    className: 'md:col-span-7',
  },
  {
    id: '05',
    icon: Wrench,
    title: 'Manutenção no radar da operação',
    description: 'Visualize máquinas com manutenção sinalizada e organize as intervenções junto ao acompanhamento da produção.',
    image: '/images/manuten%C3%A7ao.png',
    imageAlt: 'Painel de controle da produção com máquina sinalizada para manutenção',
    className: 'md:col-span-6 md:col-start-4',
  },
]

const testimonials = [
  {
    quote: 'Agora a gente sabe o que está acontecendo na fábrica sem precisar parar alguém para perguntar. O acompanhamento ficou muito mais simples.',
    name: 'Leandro M.',
    role: 'Gestor de produção',
  },
  {
    quote: 'O apontamento entrou na rotina sem complicar o trabalho do operador. A informação chega para o escritório no momento em que acontece.',
    name: 'Marina C.',
    role: 'Administradora industrial',
  },
]

function DeferredIndustrialScene({ activeMachine, onSelectMachine }) {
  const sectionRef = useRef(null)
  const [Scene, setScene] = useState(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    let mounted = true
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      observer.disconnect()
      import('./IndustrialScene').then(({ default: LoadedScene }) => {
        if (mounted) setScene(() => LoadedScene)
      })
    })

    observer.observe(section)
    return () => {
      mounted = false
      observer.disconnect()
    }
  }, [])

  if (Scene) return <Scene activeMachine={activeMachine} onSelectMachine={onSelectMachine} />

  return (
    <section ref={sectionRef} id="fabrica" aria-busy="true" className="min-h-[165svh] bg-[#0b0f19]">
      <div className="sticky top-[72px] h-[calc(100svh-72px)] min-h-[540px] overflow-hidden bg-[#0b0f19]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_50%,rgba(0,86,168,.22),transparent_52%),linear-gradient(135deg,#121722,#0b0f19)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(0,86,168,.13)_1px,transparent_1px),linear-gradient(90deg,rgba(0,86,168,.13)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f19]/95 via-[#0b0f19]/85 to-transparent md:w-[68%]" />
        <div className="absolute left-5 top-1/2 z-10 w-[calc(100%-2.5rem)] max-w-[540px] -translate-y-1/2 sm:left-10 lg:left-16">
          <span className="flex w-fit items-center gap-2 border border-white/15 bg-[#121722]/80 px-3 py-2 font-mono text-[9px] uppercase tracking-[.16em] text-slate-200 backdrop-blur sm:text-[10px]"><span className="h-1.5 w-1.5 rounded-full bg-[#e36b2c]" /> SYNCRO MOV / Tecnologia CNC</span>
          <h1 className="mt-5 text-[clamp(2.75rem,6vw,5.75rem)] font-semibold leading-[.96] tracking-[-.045em] text-white">Sua fábrica CNC.<br /><span className="text-[#60a5fa]">Em movimento.</span></h1>
          <p className="mt-5 max-w-[450px] text-sm leading-6 text-slate-300 sm:text-lg sm:leading-8">Reduza o retrabalho e tenha mais controle sobre chapas, ordens e máquinas. Enxergue o que acontece na produção antes que falhas de comunicação virem prejuízo.</p>
          <div className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
            <a href="#contato" className="group inline-flex items-center gap-3 bg-[#e36b2c] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0056a8] sm:px-6 sm:py-4">Quero reduzir retrabalho <ArrowRight size={16} className="transition group-hover:translate-x-1" /></a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-b border-[#e36b2c] pb-2 text-sm font-semibold text-white transition hover:text-[#fb923c]"><span className="h-2 w-2 rounded-full bg-[#e36b2c]" /> Falar pelo WhatsApp</a>
          </div>
          <div className="mt-8 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[.12em] text-slate-300 sm:mt-10"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400/60" /><span className="relative h-2 w-2 rounded-full bg-blue-400" /></span>Produção, apontamento e expedição em um fluxo</div>
        </div>
        <div className="absolute right-4 top-4 flex items-center gap-2 border border-white/15 bg-[#121722]/80 px-3 py-2 font-mono text-[8px] uppercase tracking-[.13em] text-slate-200 backdrop-blur sm:right-8 sm:top-8 sm:text-[9px]"><span className="h-1.5 w-1.5 rounded-full bg-[#e36b2c]" /> Preparando a linha 3D</div>
      </div>
    </section>
  )
}

function RoiCalculator() {
  const [monthlyWaste, setMonthlyWaste] = useState(8)
  const [sheetPrice, setSheetPrice] = useState(450)
  const [recoveryRate, setRecoveryRate] = useState(20)
  const monthlyLoss = monthlyWaste * sheetPrice
  const monthlyPotential = monthlyWaste * sheetPrice * recoveryRate / 100
  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

  return (
    <section id="retorno" className="border-y border-white/[0.06] bg-[#0b0f17] py-20 sm:py-24">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-12">
        <div>
          <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.2em] text-blue-300"><span className="h-px w-8 bg-blue-400" /> Faça as contas da sua fábrica</p>
          <h2 className="mt-6 max-w-[520px] text-4xl font-medium leading-[1.08] tracking-[-.045em] text-white sm:text-5xl">Quanto custa hoje a falta de visibilidade?</h2>
          <p className="mt-5 max-w-[470px] text-sm leading-7 text-slate-300">Estime o valor do material perdido e simule quanto representaria reduzir essa perda. Ajuste os números para refletir a realidade da sua operação.</p>
          <div className="mt-7 flex items-start gap-3 border-l-2 border-[#e36b2c] pl-4 text-xs leading-5 text-slate-300">
            <Calculator size={17} className="mt-0.5 shrink-0 text-[#e36b2c]" />
            <span>Simulação ilustrativa baseada nos valores informados por você. Não é promessa de economia; o resultado depende do processo e da implantação.</span>
          </div>
        </div>
        <div className="glass-panel p-5 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-200">
              Chapas perdidas por mês
              <span className="mt-2 flex items-center border border-white/10 bg-slate-950/50 focus-within:border-blue-400">
                <input type="number" min="0" step="1" value={monthlyWaste} onChange={(event) => setMonthlyWaste(Math.max(0, Number(event.target.value) || 0))} className="w-full bg-transparent px-3 py-3 text-base text-white outline-none" />
                <span className="px-3 text-xs text-slate-400">chapas</span>
              </span>
            </label>
            <label className="block text-xs font-medium text-slate-200">
              Custo médio por chapa
              <span className="mt-2 flex items-center border border-white/10 bg-slate-950/50 focus-within:border-blue-400">
                <span className="pl-3 text-sm text-slate-400">R$</span>
                <input type="number" min="0" step="10" value={sheetPrice} onChange={(event) => setSheetPrice(Math.max(0, Number(event.target.value) || 0))} className="w-full bg-transparent px-3 py-3 text-base text-white outline-none" />
              </span>
            </label>
          </div>
          <label className="mt-7 block text-xs font-medium text-slate-200">
            Redução hipotética da perda: <span className="font-semibold text-blue-300">{recoveryRate}%</span>
            <input type="range" min="0" max="50" step="5" value={recoveryRate} onChange={(event) => setRecoveryRate(Number(event.target.value))} className="mt-3 w-full accent-blue-700" />
            <span className="mt-1 flex justify-between text-[10px] font-normal text-slate-400"><span>0%</span><span>50%</span></span>
          </label>
          <div aria-live="polite" className="mt-7 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1 text-xs text-slate-400">Perda mensal estimada informada: {currency.format(monthlyLoss)}</p>
              <p className="font-mono text-[9px] uppercase tracking-[.15em] text-slate-400">Potencial mensal estimado</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-blue-300">{currency.format(monthlyPotential)}</p>
              <p className="mt-1 text-xs text-slate-400">Equivalente anual: {currency.format(monthlyPotential * 12)}</p>
            </div>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#e36b2c] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#0056a8]">Conferir esse cenário <ArrowRight size={14} /></a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Brand({ footer = false }) {
  return (
    <a href="#inicio" className="group flex shrink-0 items-center gap-3" aria-label="SYNCRO MOV, início">
      <img src="/images/logo/SyncroMov.jpg" alt="" className="h-10 w-[72px] shrink-0 object-contain transition-opacity group-hover:opacity-85" />
      <span className="leading-tight">
        <span className={`block font-bold uppercase tracking-[0.1em] text-white ${footer ? 'text-sm' : 'text-[13px]'}`}>SYNCRO <span className="text-blue-300">MOV</span></span>
        <span className="mt-1 block text-[9px] font-medium text-slate-400">Tecnologia e Inovação para Empresas</span>
      </span>
    </a>
  )
}

function App() {
  const [activeMachine, setActiveMachine] = useState('Master')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigation = [
    ['Sistema', '#sistema'],
    ['Fábrica', '#fabrica'],
    ['Funcionalidades', '#funcionalidades'],
    ['Retorno', '#retorno'],
    ['Histórias', '#historias'],
  ]

  return (
    <div className="site-root min-h-screen overflow-x-clip bg-[#0b0f17] text-slate-100 selection:bg-blue-300/30 selection:text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 text-white shadow-[0_8px_32px_rgba(0,0,0,.18)] backdrop-blur-md">
        <nav className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12" aria-label="Navegação principal">
          <Brand />
          <div className="hidden items-center gap-8 lg:flex">
            {navigation.map(([label, href]) => <a key={href} href={href} className="text-xs text-slate-300 transition hover:text-blue-300">{label}</a>)}
          </div>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="hidden items-center gap-3 bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-orange-500 sm:flex">Falar com um especialista <MessageCircle className="h-3.5 w-3.5" /></a>
          <button type="button" className="flex h-10 w-10 items-center justify-center border border-white/15 text-white lg:hidden" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
        </nav>
        {menuOpen && <div className="border-t border-white/10 bg-slate-950/95 px-5 py-4 backdrop-blur-xl lg:hidden">{navigation.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block border-b border-white/[0.06] py-3 text-sm text-slate-300 last:border-0">{label}</a>)}<a href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)} className="mt-4 flex items-center justify-between bg-blue-700 px-4 py-3 text-sm font-semibold text-white">Falar com especialista no WhatsApp <MessageCircle size={16} /></a></div>}
      </header>

      <main id="inicio" className="relative z-10 pt-[72px]">
        <DeferredIndustrialScene activeMachine={activeMachine} onSelectMachine={setActiveMachine} />

        <section id="sistema" className="py-20 sm:py-28">
          <div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:items-center lg:px-12">
            <div className="system-copy">
              <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.2em] text-emerald-200/70"><span className="h-px w-8 bg-emerald-200/60" /> O sistema em contexto</p>
              <h2 className="mt-6 max-w-[510px] text-4xl font-medium leading-[1.08] tracking-[-.045em] text-white sm:text-5xl">A informação certa, no ritmo da produção.</h2>
              <p className="mt-5 max-w-[430px] text-sm leading-7 text-slate-300 sm:text-base">Menos ruído entre escritório e operador: acompanhe máquinas, ordens e apontamentos para identificar falhas de comunicação antes que virem retrabalho.</p>
              <a href="#contato" className="mt-8 inline-flex items-center gap-3 border-b border-emerald-200/40 pb-2 text-sm text-emerald-100 transition hover:border-emerald-200">Ver uma demonstração guiada <ArrowRight size={15} /></a>
            </div>
            <div className={`overflow-hidden border bg-slate-950/35 p-2 shadow-[0_24px_64px_rgba(0,0,0,.28)] backdrop-blur-xl transition-all duration-500 sm:p-3 ${activeMachine ? 'border-blue-400/40 shadow-[0_0_0_3px_rgba(37,99,235,.12),0_24px_64px_rgba(0,0,0,.28)]' : 'border-white/10'}`}>
              <div className="flex h-10 items-center justify-between border-b border-white/10 px-3 sm:px-4"><div className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-slate-600"/><i className="h-2 w-2 rounded-full bg-slate-600"/><i className="h-2 w-2 rounded-full bg-[#e36b2c]"/></div><span className="font-mono text-[8px] uppercase tracking-[.16em] text-slate-400">SYNCRO MOV / painel ADM</span><span className="w-8" /></div>
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                <img src="/images/principal-administrador.png" alt="Dashboard administrador SYNCRO MOV com status de máquinas e ordens de produção" loading="lazy" className="h-full w-full object-contain" />
              <div key={activeMachine} className="absolute right-3 top-3 flex items-center gap-2 border border-blue-300/20 bg-slate-950/90 px-3 py-2 text-[10px] font-semibold text-blue-200 shadow-md backdrop-blur-sm sm:right-5 sm:top-5 sm:text-xs"><span className="h-2 w-2 animate-pulse rounded-full bg-[#e36b2c]" /> Máquina em foco: {activeMachine}</div>
            </div>
            <div className="flex flex-col justify-between gap-4 border-t border-white/10 px-3 py-4 sm:flex-row sm:items-center sm:px-4"><div><p className="font-mono text-[9px] uppercase tracking-[.15em] text-blue-300">A rotina da fábrica</p><h3 className="mt-1 text-base font-semibold text-white sm:text-lg">A produção inteira em uma só tela.</h3><p className="mt-1 text-xs text-slate-300">Seleção sincronizada com a máquina destacada na fábrica 3D.</p><div className="mt-3 flex flex-wrap gap-2">{['Master', 'Sintese', 'Artist'].map((machine) => <button key={machine} type="button" onClick={() => setActiveMachine(machine)} aria-pressed={activeMachine === machine} className={`border px-3 py-1.5 text-[10px] font-semibold transition ${activeMachine === machine ? 'border-blue-500 bg-blue-600 text-white' : 'border-white/10 text-slate-300 hover:border-blue-400'}`}>{machine}</button>)}</div></div><a href={whatsappUrl} target="_blank" rel="noreferrer" className="group inline-flex w-fit shrink-0 items-center gap-3 bg-[#e36b2c] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#0056a8]">Ver demonstração <ArrowRight size={15} className="transition group-hover:translate-x-1" /></a></div>
            </div>
          </div>
        </section>

        <section id="funcionalidades" className="border-y border-white/[0.06] bg-[#111827] py-20 sm:py-28">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div><p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.2em] text-emerald-200/70"><span className="h-px w-8 bg-emerald-200/60" /> Ferramentas para o dia a dia</p><h2 className="mt-6 max-w-[650px] text-4xl font-medium leading-[1.08] tracking-[-.045em] text-white sm:text-5xl">Menos ruído entre o plano e a peça pronta.</h2></div>
              <p className="max-w-[330px] text-sm leading-6 text-slate-300">Os dados circulam com a operação: do primeiro apontamento aos relatórios de acompanhamento.</p>
            </div>
            <div className="mt-12 grid gap-3 md:grid-cols-12">
              {featureCards.map(({ id, icon: Icon, title, description, image, imageAlt, className }) => <motion.article key={id} whileHover={{ y: -3 }} className={`${className} feature-card group border border-white/[0.08] bg-white/[0.035] p-5 shadow-[0_16px_44px_rgba(0,0,0,.16)] backdrop-blur-xl transition-all duration-300 hover:border-blue-300/30 hover:bg-white/[0.055] hover:shadow-[0_24px_60px_rgba(0,0,0,.28)] sm:p-7`}><div className="flex items-start justify-between"><span className="flex h-9 w-9 items-center justify-center border border-blue-300/20 bg-blue-400/10 text-blue-300"><Icon size={17} /></span><span className="font-mono text-[9px] tracking-[.15em] text-slate-500">{id} / {String(featureCards.length).padStart(2, '0')}</span></div><h3 className="mt-6 text-xl font-medium text-white sm:text-2xl">{title}</h3><p className="mt-3 max-w-[510px] text-sm leading-6 text-slate-300">{description}</p><div className="mt-7 aspect-[4/3] overflow-hidden border border-white/10 bg-slate-900 shadow-sm transition-all duration-300 group-hover:border-blue-300/20 group-hover:shadow-lg"><img src={image} alt={imageAlt} loading="lazy" className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.015]" /></div></motion.article>)}
            </div>
          </div>
        </section>

        <RoiCalculator />

        <section id="historias" className="bg-[#111827] py-20 sm:py-28">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
              <div><p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.2em] text-emerald-200/70"><span className="h-px w-8 bg-emerald-200/60" /> Quem vive a operação</p><h2 className="mt-6 max-w-[400px] text-4xl font-medium leading-[1.08] tracking-[-.045em] text-white sm:text-5xl">Mais clareza para quem faz a fábrica acontecer.</h2><p className="mt-5 max-w-[360px] text-sm leading-7 text-slate-300">Acompanhar a produção não precisa depender de conversas interrompidas ou planilhas espalhadas.</p><div className="mt-9 flex items-center gap-3 text-xs text-slate-300"><span className="flex h-9 w-9 items-center justify-center border border-emerald-200/20 text-emerald-100"><Factory size={16} /></span> Construído para a indústria moveleira</div></div>
              <div className="grid gap-3 sm:grid-cols-2">{testimonials.map((item, index) => <blockquote key={item.name} className="glass-panel flex min-h-[260px] flex-col p-6 sm:p-7"><span className="font-serif text-5xl leading-none text-blue-300">“</span><p className="mt-2 flex-1 text-base leading-7 text-slate-200">{item.quote}</p><footer className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4"><span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-300/20 bg-gradient-to-br from-blue-400/15 to-slate-800 text-xs font-bold tracking-wide text-blue-200">{item.name.split(' ').map((part) => part[0]).join('')}</span><span><span className="block text-sm font-medium text-white">{item.name}</span><span className="mt-1 block text-xs text-slate-400">{item.role} <span className="text-slate-600">·</span> Indústria de móveis</span></span></footer><span className="mt-3 font-mono text-[8px] uppercase tracking-[.16em] text-slate-500">Relato {String(index + 1).padStart(2, '0')}</span></blockquote>)}</div>
            </div>
          </div>
        </section>

        <section id="contato" className="relative overflow-hidden border-y border-white/[0.06] bg-[#0b0f17] py-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_50%,rgba(37,99,235,.14),transparent_50%),radial-gradient(ellipse_at_15%_90%,rgba(227,107,44,.07),transparent_40%)]" />
          <div className="relative mx-auto flex max-w-[1440px] flex-col justify-between gap-8 px-5 sm:px-8 md:flex-row md:items-center lg:px-12"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-orange-300">Próximo passo / 01</p><h2 className="mt-4 max-w-[680px] text-3xl font-medium leading-tight tracking-[-.035em] text-white sm:text-4xl">Sua produção merece ser vista por inteiro.</h2><p className="mt-3 text-sm text-slate-300">Converse com um especialista e veja como o Syncro MOV se encaixa na sua operação.</p></div><a href={whatsappUrl} target="_blank" rel="noreferrer" className="group inline-flex shrink-0 items-center justify-between gap-4 bg-[#e36b2c] px-5 py-4 text-sm font-semibold text-white transition hover:bg-blue-700"><MessageCircle size={17} /> Falar no WhatsApp <ArrowRight size={16} className="transition group-hover:translate-x-1" /></a></div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] bg-[#080c13]">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto_auto] md:items-center lg:px-12"><div><Brand footer /><p className="mt-4 max-w-[310px] text-xs leading-5 text-slate-400">Tecnologia para conectar gestão, operadores e máquinas na indústria moveleira.</p></div><div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-400">{navigation.map(([label, href]) => <a key={href} href={href} className="transition hover:text-blue-300">{label}</a>)}</div><div className="flex flex-col gap-2 text-xs text-slate-500 md:text-right"><a href="#contato" className="transition hover:text-blue-300">Fale com a equipe <ChevronRight className="ml-1 inline h-3 w-3" /></a><span>© 2026 SYNCRO MOV. Todos os direitos reservados.</span></div></div>
      </footer>
      <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Falar com um especialista do Syncro MOV pelo WhatsApp" title="Falar com um especialista" className="fixed bottom-20 right-5 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-[#128c4a] p-0 text-xs font-semibold text-white shadow-[0_8px_28px_rgba(18,140,74,.35)] transition hover:-translate-y-1 hover:bg-[#0d713b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128c4a] sm:bottom-24 sm:right-7 sm:h-auto sm:w-auto sm:px-4 sm:py-3 md:bottom-28 lg:bottom-32 2xl:bottom-36 2xl:px-5 2xl:py-3.5"><MessageCircle size={19} /> <span className="hidden sm:inline 2xl:hidden">WhatsApp</span><span className="hidden 2xl:inline">Fale com um especialista</span><span className="sm:hidden">WhatsApp</span></a>
    </div>
  )
}

export default App
