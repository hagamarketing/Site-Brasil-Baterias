// @ts-nocheck
/**
 * Assistente de pedido (4 passos): veículo, bateria, entrega e confirmação pelo WhatsApp.
 * Lógica portada sem mudanças de comportamento do site anterior; roda sob demanda
 * (o catálogo de ~900 veículos só é baixado quando o pedido se aproxima da tela).
 */
import dados from '@/data/veiculos.json';
import { PRECOS, brl } from '@/data/baterias';
import { site } from '@/data/site';

let iniciado = false;

export function initPedido() {
  if (iniciado) return;
  iniciado = true;
  var D = dados;
  var TIPOS = {c:'Carro', m:'Moto', t:'Caminhão'};
  var $ = function(id){ return document.getElementById(id); };
  var norm = function(s){ return String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(); };
    var anos = function(v){ return v[3] === v[4] ? String(v[3]) : v[3] + '–' + v[4]; };
  var marcaBat = function(code){ return /^Z/.test(code) ? 'Zetta' : 'Moura'; };
  var ahBat = function(code, spec){ var m = /^Z(\d+)/.exec(code); return m ? m[1] : spec[0]; };

  var V = D.v.map(function(v){ return {v:v, s:norm(v[1] + ' ' + v[2])}; });
  var st = {tipo:'c', veh:null, bat:null, step:1, reached:1};

  /* ===== Passos ===== */
  function go(n){
    st.step = n; if (n > st.reached) st.reached = n;
    document.body.classList.toggle('on-final', n === 4);
    for (var i=1;i<=4;i++) $('p'+i).hidden = i !== n;
    document.querySelectorAll('#steps li').forEach(function(li){
      var s = +li.dataset.s; li.className = s === n ? 'on' : (s <= st.reached ? 'done' : '');
      if (s === n) li.setAttribute('aria-current','step'); else li.removeAttribute('aria-current');
      /* etapas já preenchidas viram botões de navegação */
      var nav = s !== n && s <= st.reached;
      li.classList.toggle('nav', nav);
      if (nav){ li.setAttribute('role','button'); li.tabIndex = 0; }
      else { li.removeAttribute('role'); li.removeAttribute('tabindex'); }
    });
    var box = $('pedido'), r = box.getBoundingClientRect();
    if (r.top < 0 || r.top > window.innerHeight * .6) box.scrollIntoView({behavior:'smooth', block:'start'});
  }
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-go]'); if (b) go(+b.dataset.go);
  });
  /* Clique (ou Enter/Espaço) numa etapa já preenchida do topo do cartão */
  function irEtapa(li){
    if (!li || !li.classList.contains('nav')) return;
    var n = +li.dataset.s;
    if (n === 4){ if (!validate()) { go(3); validate(); return; } buildSummary(); }
    go(n);
  }
  $('steps').addEventListener('click', function(e){ irEtapa(e.target.closest('li')); });
  $('steps').addEventListener('keydown', function(e){
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var li = e.target.closest('li'); if (!li || !li.classList.contains('nav')) return;
    e.preventDefault(); irEtapa(li);
  });

  /* ===== Passo 1: veículo ===== */
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function search(){
    var q = norm($('busca').value.trim());
    var toks = q ? q.split(/\s+/) : [];
    var words = toks.filter(function(t){ return !/^\d{4}$/.test(t); });
    var years = toks.filter(function(t){ return /^\d{4}$/.test(t); }).map(Number);
    var out = V.filter(function(x){
      var v = x.v;
      if (v[0] !== st.tipo) return false;
      for (var i=0;i<words.length;i++) if (x.s.indexOf(words[i]) < 0) return false;
      for (var j=0;j<years.length;j++) if (years[j] < v[3] || years[j] > v[4]) return false;
      return true;
    });
    var LIM = 80;
    $('contagem').textContent = !q ? '' : out.length === 0 ? '' :
      out.length === 1 ? '1 veículo encontrado' : out.length + ' veículos encontrados' + (out.length > LIM ? '. Refine a busca para ver todos.' : '');
    if (!q){
      $('resultados').innerHTML = '<li class="empty">Digite o modelo, o ano ou a montadora. Temos ' + V.filter(function(x){return x.v[0]===st.tipo;}).length.toLocaleString('pt-BR') + ' carros cadastrados.</li>';
      return;
    }
    if (!out.length){
      $('resultados').innerHTML = '<li class="empty">Nenhum veículo encontrado. Confira a grafia ou <a href="https://wa.me/' + site.whatsapp + '?text=' + encodeURIComponent('Olá! Não encontrei meu veículo no site. Podem me ajudar a escolher a bateria?') + '" target="_blank" rel="noopener">fale com a gente no WhatsApp</a>.</li>';
      return;
    }
    $('resultados').innerHTML = out.slice(0, LIM).map(function(x){
      var v = x.v, i = D.v.indexOf(v);
      return '<li><button type="button" data-i="' + i + '"><span class="m">' + esc(v[2]) + '</span><span class="mk">' + esc(v[1]) + '</span><span class="yr tnum">' + anos(v) + '</span></button></li>';
    }).join('');
  }

  $('busca').addEventListener('input', function(){
    search();
    /* apagou o carro: volta tudo ao começo (veículo, bateria, entrega e resumo) */
    if (!this.value.trim() && (st.veh || st.reached > 1)) limparPedido();
  });
  $('resultados').addEventListener('click', function(e){
    var b = e.target.closest('button[data-i]'); if (!b) return;
    pickVehicle(D.v[+b.dataset.i]);
  });

  /* ===== Passo 2: bateria ===== */
  function pickVehicle(v){
    st.veh = v; st.bat = v[5]; st.reached = 1;
    $('v-nome').textContent = v[1] + ' ' + v[2];
    $('v-anos').textContent = 'Ano ' + anos(v);
    var spec = D.b[v[5]] || [];
    var avisos = '';
    if (v[8] & 2) avisos += '<div class="note"><b>Troca especial</b>A bateria deste veículo exige um processo especial de instalação. Por isso, a troca é feita na nossa loja.</div>';
    if (v[8] & 1) avisos += '<div class="note"><b>Veículo elétrico ou híbrido</b>Esta é a bateria auxiliar de 12 V, que alimenta os sistemas do carro. Não é a bateria de tração.</div>';
    if (v[7]) avisos += '<div class="note"><b>Bateria auxiliar</b>Este veículo também usa a bateria auxiliar ' + esc(v[7]) + '. Avise se quiser trocar as duas.</div>';
    $('avisos').innerHTML = avisos; $('avisos').hidden = !avisos;

    var opts = [{code:v[5], main:true}];
    if (v[6]) opts.push({code:v[6], main:false});
    $('bats').innerHTML = opts.map(function(o){
      var z = marcaBat(o.code) === 'Zetta', p = PRECOS[o.code];
      var specs = o.main ?
        '<dl class="specs"><div><dt>Capacidade</dt><dd>' + spec[0] + ' Ah</dd></div><div><dt>Partida (CCA)</dt><dd>' + spec[1] + ' A</dd></div><div><dt>Tecnologia</dt><dd>' + esc(cap(spec[6]||'')) + '</dd></div><div><dt>Garantia</dt><dd>' + spec[7] + ' meses</dd></div><div><dt>Medidas (mm)</dt><dd>' + spec[2] + '×' + spec[3] + '×' + spec[4] + '</dd></div><div><dt>Peso</dt><dd>' + String(spec[5]).replace('.',',') + ' kg</dd></div></dl>'
        : '<dl class="specs"><div><dt>Capacidade</dt><dd>' + ahBat(o.code, spec) + ' Ah</dd></div><div><dt>Fabricante</dt><dd>Grupo Moura</dd></div><div><dt>Garantia</dt><dd>18 meses</dd></div></dl>';
      return '<label class="bat"><input type="radio" name="bat" value="' + esc(o.code) + '"' + (o.code === st.bat ? ' checked' : '') + '>' +
        '<img class="bat-img" src="/imagens/' + (z ? 'zetta' : 'moura') + '.webp" width="96" height="74" loading="lazy" decoding="async" alt="Bateria ' + marcaBat(o.code) + ' ' + esc(o.code) + '">' +
        '<div style="min-width:0"><div class="bat-head"><h3>' + marcaBat(o.code) + ' ' + esc(o.code) + '</h3><span class="tag' + (o.main ? '' : ' alt') + '">' + (o.main ? 'Indicada' : 'Opção econômica') + '</span></div>' +
        specs + '<p class="price">' + (p ? brl(p) + ' <small>à base de troca</small>' : '<small>Preço confirmado pelo WhatsApp</small>') + '</p></div></label>';
    }).join('');

    var lojaOnly = !!(v[8] & 2);
    var ent = document.querySelector('input[name="modo"][value="entrega"]');
    ent.disabled = lojaOnly; $('opt-entrega').classList.toggle('off', lojaOnly);
    if (lojaOnly) document.querySelector('input[name="modo"][value="loja"]').checked = true;
    syncModo();
    go(2);
  }
  function cap(s){ return s ? s.charAt(0) + s.slice(1).toLowerCase() : ''; }
  $('bats').addEventListener('change', function(e){ if (e.target.name === 'bat') st.bat = e.target.value; });
  $('to3').addEventListener('click', function(){ go(3); });

  /* ===== Passo 3: dados ===== */
  var form = $('p3');
  function val(name){ var r = form.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : ''; }
  function syncModo(){ $('endereco').hidden = val('modo') === 'loja'; }
  form.addEventListener('change', function(e){
    if (e.target.name === 'modo') syncModo();
    if (e.target.name === 'quando') $('agenda').hidden = val('quando') !== 'agendar';
    if (e.target.name === 'pag') $('troco-box').hidden = val('pag') !== 'Dinheiro';
    saveDraft();
  });
  form.addEventListener('input', saveDraft);

  var hoje = new Date(); hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
  $('data').min = hoje.toISOString().slice(0,10);

  $('fone').addEventListener('input', function(){
    var d = this.value.replace(/\D/g,'').slice(0,11);
    this.value = d.length > 10 ? '(' + d.slice(0,2) + ') ' + d.slice(2,7) + '-' + d.slice(7) :
      d.length > 6 ? '(' + d.slice(0,2) + ') ' + d.slice(2,6) + '-' + d.slice(6) :
      d.length > 2 ? '(' + d.slice(0,2) + ') ' + d.slice(2) : d;
  });
  var cepBuscado = '';
  function mostrarEndereco(foco){
    var c = $('end-campos'); if (!c.hidden) return;
    c.hidden = false; $('sem-cep').hidden = true;
    if (foco) $(foco).focus();
  }
  /* CEP apagado: esconde o endereço, limpa o que veio dele e devolve o "Não sei meu CEP" */
  function esconderEndereco(){
    if ($('end-campos').hidden) return;
    $('end-campos').hidden = true; $('sem-cep').hidden = false;
    ['rua','num','bairro','ref'].forEach(function(k){ $(k).value = ''; });
    ['rua','num','bairro'].forEach(function(k){ setErr(k, ''); });
    $('cidade').value = 'Marília - SP';
    saveDraft();
  }
  $('sem-cep').addEventListener('click', function(){
    cepMsg('Preencha o endereço abaixo.');
    mostrarEndereco('rua');
  });
  function cepMsg(txt, cls){ var m = $('cep-msg'); m.textContent = txt; m.className = 'cep-msg' + (cls ? ' ' + cls : ''); }
  $('cep').addEventListener('input', function(){
    var d = this.value.replace(/\D/g,'').slice(0,8);
    this.value = d.length > 5 ? d.slice(0,5) + '-' + d.slice(5) : d;
    if (d.length === 8 && d !== cepBuscado) buscaCep(d);
    if (d.length < 8) { cepBuscado = ''; cepMsg('Digite o CEP para preencher o endereço automaticamente.'); }
    if (!d.length) esconderEndereco();
  });
  function buscaCep(d){
    cepBuscado = d;
    cepMsg('Buscando endereço…');
    var ctrl = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function(){ if (ctrl) ctrl.abort(); }, 6000);
    fetch('https://viacep.com.br/ws/' + d + '/json/', ctrl ? {signal: ctrl.signal} : {})
      .then(function(r){ if (!r.ok) throw 0; return r.json(); })
      .then(function(j){
        clearTimeout(t);
        if (d !== cepBuscado) return;
        if (j.erro) { cepMsg('CEP não encontrado. Confira o número ou preencha o endereço abaixo.', 'bad'); mostrarEndereco(); return; }
        if (j.logradouro) $('rua').value = j.logradouro;
        if (j.bairro) $('bairro').value = j.bairro;
        if (j.localidade) $('cidade').value = j.localidade + (j.uf ? ' - ' + j.uf : '');
        ['rua','bairro'].forEach(function(k){ if ($(k).value) setErr(k, ''); });
        cepMsg('Endereço preenchido. Confira e informe o número.', 'ok');
        saveDraft();
        mostrarEndereco(j.logradouro ? 'num' : 'rua');
      })
      .catch(function(){
        clearTimeout(t);
        if (d === cepBuscado) { cepMsg('Não foi possível buscar o CEP agora. Preencha o endereço abaixo.', 'bad'); mostrarEndereco(); }
      });
  }

  function setErr(id, msg){
    var f = $(id).closest('.field'), e = f.querySelector('.err');
    f.classList.toggle('bad', !!msg); e.hidden = !msg; e.textContent = msg || '';
    return !msg;
  }
  function validate(){
    var ok = true, first = null;
    function chk(id, msg){ if (!setErr(id, msg) ){ ok = false; first = first || id; } }
    chk('nome', $('nome').value.trim().length < 2 ? 'Informe seu nome.' : '');
    chk('fone', $('fone').value.replace(/\D/g,'').length < 10 ? 'Informe o WhatsApp com DDD.' : '');
    var entrega = val('modo') === 'entrega';
    if (entrega && $('end-campos').hidden){
      cepMsg('Digite o CEP ou toque em "Não sei meu CEP" para informar o endereço.', 'bad');
      ok = false; first = first || 'cep';
    }
    chk('rua', entrega && !$('rua').value.trim() ? 'Informe a rua.' : '');
    chk('num', entrega && !$('num').value.trim() ? 'Informe o número.' : '');
    chk('bairro', entrega && !$('bairro').value.trim() ? 'Informe o bairro.' : '');
    var dmsg = '';
    if (val('quando') === 'agendar'){
      var dv = $('data').value;
      if (!dv) dmsg = 'Escolha uma data.';
      else if (dv < $('data').min) dmsg = 'Escolha hoje ou uma data futura.';
      else {
        var wd = new Date(dv + 'T12:00:00').getDay();
        if (wd === 0) dmsg = 'Não abrimos aos domingos. Escolha outro dia.';
        else if (wd === 6 && $('periodo').value.indexOf('Tarde') === 0) dmsg = 'Aos sábados atendemos até 13h. Escolha a manhã.';
      }
    }
    chk('data', dmsg);
    if (first) $(first).focus();
    return ok;
  }
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if (!validate()) return;
    buildSummary(); go(4);
  });

  /* ===== Passo 4: resumo e WhatsApp ===== */
  var pedidoId = '';
  function linhas(){
    var v = st.veh, spec = D.b[v[5]] || [], code = st.bat, main = code === v[5];
    var batTxt = marcaBat(code) + ' ' + code + ' · ' + ahBat(code, spec) + ' Ah' + (main ? ' · ' + spec[7] + ' meses de garantia' : ' · 18 meses de garantia') + (PRECOS[code] ? ' · ' + brl(PRECOS[code]) : '');
    var entrega = val('modo') === 'entrega';
    var quando = val('quando') === 'agendar' ? $('data').value.split('-').reverse().join('/') + ', ' + $('periodo').value : 'O quanto antes';
    var pag = val('pag') + (val('pag') === 'Dinheiro' && $('troco').value.trim() ? ' (troco para ' + $('troco').value.trim() + ')' : '');
    var end = entrega ? $('rua').value.trim() + ', ' + $('num').value.trim() + ' - ' + $('bairro').value.trim() + ', ' + ($('cidade').value.trim() || 'Marília - SP') +
      ($('cep').value ? ' - CEP ' + $('cep').value : '') + ($('ref').value.trim() ? ' (' + $('ref').value.trim() + ')' : '') : 'Instalação na loja: Av. Pedro de Toledo, 1894, Palmital';
    var L = [
      ['Carro', v[1] + ' ' + v[2] + ' (' + anos(v) + ')'],
      ['Bateria', batTxt]
    ];
    if (v[7]) L.push(['Auxiliar', v[7] + ' (indicada para este veículo)']);
    L.push(['Base de troca', val('base') === 'sim' ? 'Sim, entrego a bateria usada' : 'Não tenho bateria usada']);
    L.push(['Cliente', $('nome').value.trim() + ' · ' + $('fone').value]);
    L.push([entrega ? 'Entrega' : 'Atendimento', end]);
    L.push(['Quando', quando]);
    L.push(['Pagamento', pag + ' (na entrega)']);
    if ($('obs').value.trim()) L.push(['Observações', $('obs').value.trim()]);
    return L;
  }
  function mensagem(){
    var t = '*Novo pedido pelo site - Brasil Baterias*\nPedido ' + pedidoId + '\n\n';
    linhas().forEach(function(l){ t += '*' + l[0] + ':* ' + l[1] + '\n'; });
    return t + '\nAguardo a confirmação do valor e do horário.';
  }
  function buildSummary(){
    var d = new Date();
    pedidoId = '#BB' + String(d.getDate()).padStart(2,'0') + String(d.getMonth()+1).padStart(2,'0') + '-' + Math.random().toString(36).slice(2,6).toUpperCase();
    $('resumo').innerHTML = linhas().map(function(l){ return '<div><dt>' + esc(l[0]) + '</dt><dd>' + esc(l[1]) + '</dd></div>'; }).join('');
    $('enviar').href = 'https://wa.me/' + site.whatsapp + '?text=' + encodeURIComponent(mensagem());
    $('enviado').hidden = true;
  }
  $('enviar').addEventListener('click', function(){ $('enviado').hidden = false; });
  $('copiar').addEventListener('click', function(){
    var b = this, txt = mensagem();
    function done(){ b.textContent = 'Pedido copiado'; setTimeout(function(){ b.textContent = 'Copiar pedido'; }, 2200); }
    function fallback(){
      var ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch(e){} ta.remove();
    }
    try { navigator.clipboard.writeText(txt).then(done, fallback); } catch(e){ fallback(); }
  });

  /* ===== Recomeçar o pedido ===== */
  function limparPedido(){
    st.veh = null; st.bat = null; st.reached = 1;
    form.reset();
    ['nome','fone','rua','num','bairro','data'].forEach(function(k){ setErr(k, ''); });
    $('agenda').hidden = true; $('troco-box').hidden = true; syncModo();
    cepBuscado = ''; cepMsg('Digite o CEP para preencher o endereço automaticamente.');
    $('end-campos').hidden = true; $('sem-cep').hidden = false;
    $('bats').innerHTML = ''; $('avisos').innerHTML = ''; $('avisos').hidden = true;
    $('resumo').innerHTML = ''; $('enviado').hidden = true; pedidoId = '';
    try { sessionStorage.removeItem('bb-cliente'); } catch(e){}
    go(1);
  }

  /* ===== Rascunho dos dados do cliente (só neste navegador) ===== */
  var DRAFT = ['nome','fone','rua','num','bairro','cidade','cep','ref'];
  function saveDraft(){
    try { var o = {}; DRAFT.forEach(function(k){ o[k] = $(k).value; }); sessionStorage.setItem('bb-cliente', JSON.stringify(o)); } catch(e){}
  }
  /* dados ficam só enquanto a aba está aberta; ao fechar o site, somem (e apaga o que versões antigas guardaram) */
  try { localStorage.removeItem('bb-cliente'); } catch(e){}
  try { var saved = JSON.parse(sessionStorage.getItem('bb-cliente') || 'null'); if (saved) { DRAFT.forEach(function(k){ if (saved[k]) $(k).value = saved[k]; }); if (saved.rua) mostrarEndereco(); } } catch(e){}

  search();
  $('p1').hidden = false; document.querySelector('#steps li').className = 'on';
}
