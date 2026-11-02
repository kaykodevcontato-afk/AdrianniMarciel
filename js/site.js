/* ===============================================================
   ADRIANNI MACIEL — INTERATIVIDADE
   Os dados de contato ficam em js/config.js.
   Campos do agendamento podem ser alterados no arquivo index.html.
   =============================================================== */
'use strict';

const CONFIG = window.SITE_CONFIG || {};
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

// 1. Cabeçalho e navegação para celulares.
const header = $('.site-header');
const menuToggle = $('#menuToggle');
const nav = $('#menuPrincipal');
const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();
menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  nav.classList.toggle('open', open);
});
$$('.site-nav a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
}));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && nav.classList.contains('open')) {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.focus();
  }
});

// 2. Animações discretas ao entrar na tela.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducedMotion || !('IntersectionObserver' in window)) {
  $$('.reveal').forEach(el => el.classList.add('visible'));
} else {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px 60px 0px' });
  $$('.reveal').forEach(el => observer.observe(el));
}

// 3. Galeria de resultados.
const photos = [
  { src: 'assets/img/melasma-frontal.jpg', title: 'Melasma — vista frontal' },
  { src: 'assets/img/melasma-lateral-esquerda.jpg', title: 'Melasma — perfil lateral' },
  { src: 'assets/img/melasma-lateral-direita.jpg', title: 'Melasma — outro ângulo' }
];
const track = $('#resultsTrack');
const resultWidth = () => $('.result-card')?.getBoundingClientRect().width || 325;
$('#resultPrev')?.addEventListener('click', () => track.scrollBy({ left: -(resultWidth() + 22), behavior: reducedMotion ? 'instant' : 'smooth' }));
$('#resultNext')?.addEventListener('click', () => track.scrollBy({ left: resultWidth() + 22, behavior: reducedMotion ? 'instant' : 'smooth' }));
const dialog = $('#galleryDialog');
let galleryIndex = 0;
function setGallery(index) {
  galleryIndex = (index + photos.length) % photos.length;
  $('#galleryImage').src = photos[galleryIndex].src;
  $('#galleryImage').alt = `Comparativo antes e depois — ${photos[galleryIndex].title}`;
  $('#galleryTitle').textContent = photos[galleryIndex].title;
  $('#galleryCounter').textContent = `${galleryIndex + 1} / ${photos.length}`;
}
$$('[data-gallery]').forEach(button => button.addEventListener('click', () => {
  setGallery(Number(button.dataset.gallery));
  if (typeof dialog.showModal === 'function') dialog.showModal();
}));
$('#closeGallery')?.addEventListener('click', () => dialog.close());
$('#galleryBack')?.addEventListener('click', () => setGallery(galleryIndex - 1));
$('#galleryForward')?.addEventListener('click', () => setGallery(galleryIndex + 1));
dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog?.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') setGallery(galleryIndex - 1);
  if (event.key === 'ArrowRight') setGallery(galleryIndex + 1);
});

// 4. Não tocar vários vídeos ao mesmo tempo.
$$('video').forEach(video => video.addEventListener('play', () => {
  $$('video').forEach(other => { if (other !== video) other.pause(); });
}));

// 5. Agendamento via WhatsApp + serviço de envio de e-mails FormSubmit.
const form = $('#bookingForm');
const dateInput = $('#date');
const phoneInput = $('#clientPhone');
const serviceInput = $('#service');
const submitButton = $('#submitBooking');
const feedback = $('#formFeedback');
const cleanDigits = value => String(value || '').replace(/\D/g, '');
const fmtDate = value => {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};
function setMinDate() {
  const local = new Date();
  const yyyy = local.getFullYear();
  const mm = String(local.getMonth() + 1).padStart(2, '0');
  const dd = String(local.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;
}
setMinDate();

phoneInput.addEventListener('input', () => {
  const digits = cleanDigits(phoneInput.value).slice(0, 11);
  let value = digits;
  if (digits.length > 2) value = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length > 7) value = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  phoneInput.value = value;
  phoneInput.classList.remove('invalid');
});

// Quando a visitante clicar num tratamento, seleciona a opção na ficha.
$$('[data-service]').forEach(link => link.addEventListener('click', () => {
  const chosen = link.dataset.service;
  const matches = [...serviceInput.options].some(option => option.value === chosen);
  if (matches) serviceInput.value = chosen;
}));

// Atualiza os links de contato sem exibir números fictícios.
const ownerWhatsapp = cleanDigits(CONFIG.whatsapp);
const ownerEmail = String(CONFIG.email || '').trim();
const defaultWhatsappText = encodeURIComponent('Olá! Gostaria de informações sobre os atendimentos da Adrianni Maciel.');
if (ownerWhatsapp.length >= 12) {
  const waLink = `https://wa.me/${ownerWhatsapp}?text=${defaultWhatsappText}`;
  $('#footerWhatsapp').href = waLink;
  $('#footerWhatsapp').target = '_blank';
  $('#footerWhatsapp').rel = 'noopener noreferrer';
  const floatContact = $('#floatContact');
  if (floatContact) {
    floatContact.href = waLink;
    floatContact.target = '_blank';
    floatContact.rel = 'noopener noreferrer';
    floatContact.setAttribute('aria-label', 'Falar no WhatsApp');
  }
}
const footerInstagram = $('#footerInstagram');
if (footerInstagram && String(CONFIG.instagram || '').trim()) {
  footerInstagram.href = String(CONFIG.instagram).trim();
  footerInstagram.target = '_blank';
  footerInstagram.rel = 'noopener noreferrer';
}
if (ownerEmail.includes('@')) {
  $('#footerEmail').href = `mailto:${encodeURIComponent(ownerEmail)}?subject=${encodeURIComponent('Informações sobre atendimento')}`;
} else {
  const emailLink = $('#footerEmail');
  if (emailLink) emailLink.style.display = 'none';
}
if (CONFIG.endereco) $('#footerLocation').textContent = CONFIG.endereco;
$('#year').textContent = String(new Date().getFullYear());

function showFeedback(text, error = false, html = false) {
  feedback.hidden = false;
  feedback.classList.toggle('error', error);
  if (html) feedback.innerHTML = text; else feedback.textContent = text;
}
function clearFeedback() { feedback.hidden = true; feedback.textContent = ''; feedback.classList.remove('error'); }
function validateBooking() {
  $$('.invalid', form).forEach(el => el.classList.remove('invalid'));
  const fields = ['#clientName', '#clientPhone', '#service', '#date', '#time'];
  for (const selector of fields) {
    const input = $(selector);
    if (!input.value || (selector === '#clientName' && input.value.trim().length < 3)) {
      input.classList.add('invalid');input.focus();
      showFeedback('Preencha os campos obrigatórios para continuar.', true);
      return false;
    }
  }
  const digits = cleanDigits(phoneInput.value);
  if (digits.length < 10 || digits.length > 11) {
    phoneInput.classList.add('invalid');phoneInput.focus();
    showFeedback('Informe um WhatsApp válido com DDD (10 ou 11 dígitos).', true);
    return false;
  }
  if (dateInput.value < dateInput.min) {
    dateInput.classList.add('invalid');dateInput.focus();
    showFeedback('Escolha uma data de hoje em diante.', true);
    return false;
  }
  if (!$('#consent').checked) {
    $('#consent').focus();
    showFeedback('Para enviar, autorize o contato usando os dados informados.', true);
    return false;
  }
  return true;
}
function prepareBooking() {
  return {
    nome: $('#clientName').value.trim(),
    telefone: $('#clientPhone').value.trim(),
    servico: serviceInput.value,
    data: fmtDate(dateInput.value),
    horario: $('#time').value,
    observacao: $('#comment').value.trim().slice(0, 300)
  };
}
function bookingText(data) {
  return [
    'Olá! Gostaria de solicitar um agendamento com Adrianni Maciel. 🌷',
    '',
    `Nome: ${data.nome}`,
    `WhatsApp: ${data.telefone}`,
    `Atendimento: ${data.servico}`,
    `Data desejada: ${data.data}`,
    `Horário desejado: ${data.horario}`,
    data.observacao ? `Observação: ${data.observacao}` : null,
    '',
    'Se houver disponibilidade, podem confirmar este horário? Obrigada!'
  ].filter(line => line !== null).join('\n');
}
function showCopyFallback(message, explanation) {
  showFeedback(`${explanation}<div style="margin-top:10px"><button type="button" id="copyBookingButton">Copiar solicitação</button></div>`, false, true);
  $('#copyBookingButton').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(message);
      $('#copyBookingButton').textContent = 'Solicitação copiada ✓';
    } catch {
      const box = document.createElement('textarea');box.value = message;
      feedback.appendChild(box);box.select();
      $('#copyBookingButton').textContent = 'Selecione e copie o texto abaixo';
    }
  });
}
async function sendEmail(data) {
  if (!ownerEmail.includes('@')) return { attempted: false, success: false };
  if (CONFIG.usaFormSubmit === false) {
    const body = bookingText(data);
    window.location.href = `mailto:${ownerEmail}?subject=${encodeURIComponent('Pedido de agendamento — Adrianni Maciel')}&body=${encodeURIComponent(body)}`;
    return { attempted: true, success: false, composed: true };
  }
  const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(ownerEmail)}`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        Nome: data.nome,
        WhatsApp: data.telefone,
        Atendimento: data.servico,
        'Data desejada': data.data,
        'Horário desejado': data.horario,
        Observação: data.observacao || 'Não informada',
        Origem: 'Site Adrianni Maciel',
        _subject: `Novo pedido de agendamento: ${data.nome} — ${data.data} ${data.horario}`,
        _captcha: 'false',
        _template: 'table'
      })
    });
    const result = await response.json().catch(() => ({}));
    return { attempted: true, success: response.ok && (result.success === true || result.success === 'true') };
  } catch (err) {
    return { attempted: true, success: false };
  }
}
form.addEventListener('submit', async event => {
  event.preventDefault();clearFeedback();setMinDate();
  if (!validateBooking()) return;
  const data = prepareBooking();
  const message = bookingText(data);
  const waReady = ownerWhatsapp.length >= 12;
  const emailReady = ownerEmail.includes('@');
  if (!waReady && !emailReady) {
    showCopyFallback(message, '<strong>Prévia do agendamento:</strong> Os contatos da profissional ainda não foram preenchidos em <code>js/config.js</code>. Você pode copiar a solicitação para conferir como ficará.');
    return;
  }
  submitButton.disabled = true;
  submitButton.style.opacity = '.7';
  const originalLabel = submitButton.innerHTML;
  submitButton.textContent = 'Preparando sua solicitação...';
  let whatsappOpened = false;
  if (waReady) {
    const url = `https://wa.me/${ownerWhatsapp}?text=${encodeURIComponent(message)}`;
    // Abrir na ação de clique evita bloqueio de janelas durante a chamada de e-mail.
    const newTab = window.open(url, '_blank');
    if (newTab) newTab.opener = null;
    whatsappOpened = !!newTab;
    if (!whatsappOpened) {
      // Abrir novamente com um link clicável se o navegador bloquear pop-ups.
      showFeedback(`O WhatsApp não abriu automaticamente. <a href="${url}" target="_blank" rel="noopener noreferrer">Clique aqui para continuar pelo WhatsApp.</a>`, false, true);
    }
  }
  const result = emailReady ? await sendEmail(data) : { attempted: false, success: false };
  submitButton.disabled = false;
  submitButton.style.opacity = '';
  submitButton.innerHTML = originalLabel;
  const fallbackWaUrl = `https://wa.me/${ownerWhatsapp}?text=${encodeURIComponent(message)}`;
  const waFallback = !whatsappOpened && waReady ? ` <a href="${fallbackWaUrl}" target="_blank" rel="noopener noreferrer">Abrir WhatsApp aqui.</a>` : '';
  if (result.success && waReady) {
    showFeedback(`Pedido encaminhado ao serviço de e-mail. Abra o WhatsApp e toque em Enviar para concluir. O horário dependerá da confirmação da equipe.${waFallback}`, false, !!waFallback);
  } else if (result.success) {
    showFeedback('Seu pedido foi recebido pelo serviço de e-mail. Aguarde a resposta da equipe para confirmar o horário.');
  } else if (result.composed) {
    showFeedback('O aplicativo de e-mail foi aberto para você revisar e enviar sua solicitação. Aguarde a confirmação de horário da equipe.');
  } else if (waReady) {
    const emailInfo = emailReady ? ' O envio automático por e-mail não pôde ser confirmado; revise a ativação do FormSubmit em INSTRUCOES.txt.' : '';
    const popupInfo = whatsappOpened ? 'Abra a conversa e toque em Enviar.' : 'Se necessário, utilize o link para abrir a conversa.';
    showFeedback(`${popupInfo} O agendamento ainda precisa ser confirmado pela equipe.${emailInfo}${waFallback}`, false, !!waFallback);
  } else {
    showCopyFallback(message, 'Não foi possível confirmar o envio do e-mail. Confira sua conexão e a configuração do FormSubmit, ou copie os dados para tentar novamente.');
  }
});

// 6. O botão flutuante não deve cobrir o crédito do desenvolvedor
// nem os links de contato quando a visitante chega ao rodapé.
const footerForFloatingButton = $('.site-footer');
const floatingBookingButton = $('#floatContact');
if (footerForFloatingButton && floatingBookingButton) {
  const updateFloatingButton = () => {
    const footerRect = footerForFloatingButton.getBoundingClientRect();
    const footerOnScreen = footerRect.top < window.innerHeight && footerRect.bottom > 0;
    floatingBookingButton.classList.toggle('is-over-footer', footerOnScreen);
    // Impede navegação por teclado para um botão que esteja oculto.
    floatingBookingButton.tabIndex = footerOnScreen ? -1 : 0;
  };
  window.addEventListener('scroll', updateFloatingButton, {passive:true});
  window.addEventListener('resize', updateFloatingButton, {passive:true});
  updateFloatingButton();
}
