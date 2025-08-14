// script.js

// ——— Navigation burger accessible ———
const navToggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('primary-nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    nav.style.display = expanded ? 'none' : 'block';
  });
  // Hide on link click (mobile)
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && window.innerWidth < 900) {
      nav.style.display = 'none';
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ——— Accordéons accessibles ———
const triggers = document.querySelectorAll('.accordion-trigger');
triggers.forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', String(!expanded));
    if (panel) {
      if (expanded) {
        panel.hidden = true;
      } else {
        panel.hidden = false;
      }
    }
  });
});

// ——— Année dynamique footer ———
document.getElementById('year').textContent = new Date().getFullYear();

// ——— Validation formulaire & mailto ———
const form = document.getElementById('inscriptionForm');
const errorsBox = document.getElementById('formErrors');

function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg || '';
}
function clearAllErrors() {
  errorsBox.textContent = '';
  ['err-enfantNom','err-enfantPrenom','err-dateNaissance','err-parentNom','err-parentEmail','err-parentTel','err-jours','err-consents']
    .forEach(id => setError(id, ''));
}

function validateAge0to5(isoDate) {
  if (!isoDate) return false;
  const dob = new Date(isoDate);
  const now = new Date();
  if (dob > now) return false;
  let ageYears = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) ageYears--;
  return ageYears >= 0 && ageYears < 6; // 0–5 ans inclus
}

function validatePhoneBasic(val) {
  const digits = (val || '').replace(/[^\d]/g,'');
  return digits.length >= 10 && digits.length <= 15;
}

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  clearAllErrors();

  const enfantNom = document.getElementById('enfantNom').value.trim();
  const enfantPrenom = document.getElementById('enfantPrenom').value.trim();
  const dateNaissance = document.getElementById('dateNaissance').value;
  const sante = document.getElementById('sante').value.trim();
  const parentNom = document.getElementById('parentNom').value.trim();
  const parentEmail = document.getElementById('parentEmail').value.trim();
  const parentTel = document.getElementById('parentTel').value.trim();
  const parentAdresse = document.getElementById('parentAdresse').value.trim();
  const plageHoraire = document.getElementById('plageHoraire').value;
  const dateDebut = document.getElementById('dateDebut').value;

  const jours = Array.from(document.querySelectorAll('input[name="jours"]:checked')).map(i => i.value);
  const consentRGPD = document.getElementById('consentRGPD').checked;
  const consentReglement = document.getElementById('consentReglement').checked;

  let ok = true;

  if (!enfantNom) { setError('err-enfantNom','Veuillez renseigner le nom de l’enfant.'); ok = false; }
  if (!enfantPrenom) { setError('err-enfantPrenom','Veuillez renseigner le prénom de l’enfant.'); ok = false; }
  if (!validateAge0to5(dateNaissance)) { setError('err-dateNaissance','L’enfant doit avoir entre 0 et 5 ans.'); ok = false; }

  if (!parentNom) { setError('err-parentNom','Votre nom est requis.'); ok = false; }
  if (!parentEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(parentEmail)) {
    setError('err-parentEmail','Adresse email invalide.');
    ok = false;
  }
  if (!validatePhoneBasic(parentTel)) {
    setError('err-parentTel','Numéro de téléphone invalide (10 à 15 chiffres).');
    ok = false;
  }
  if (jours.length === 0) { setError('err-jours','Sélectionnez au moins un jour.'); ok = false; }
  if (!consentRGPD || !consentReglement) {
    setError('err-consents','Veuillez accepter les consentements.');
    ok = false;
  }

  if (!ok) {
    errorsBox.textContent = 'Veuillez corriger les champs indiqués en rouge.';
    errorsBox.focus?.();
    return;
  }

  // Construction du mailto
  const subject = `Inscription — Garderie Éducative Lajoie — ${enfantPrenom} ${enfantNom}`;
  const bodyLines = [
    'Demande d’inscription',
    '=====================',
    '',
    '🧒 Enfant',
    `Nom : ${enfantNom}`,
    `Prénom : ${enfantPrenom}`,
    `Date de naissance : ${dateNaissance}`,
    `Allergies / santé : ${sante || '—'}`,
    '',
    '👤 Parent / Tuteur',
    `Nom : ${parentNom}`,
    `Email : ${parentEmail}`,
    `Téléphone : ${parentTel}`,
    `Adresse : ${parentAdresse || '—'}`,
    '',
    '📅 Besoins',
    `Jours souhaités : ${jours.join(', ')}`,
    `Horaires : ${plageHoraire || '—'}`,
    `Date de début souhaitée : ${dateDebut || '—'}`,
    '',
    '✅ Consentements',
    `RGPD : ${consentRGPD ? 'Oui' : 'Non'} | Règlement : ${consentReglement ? 'Oui' : 'Non'}`
  ];

  const mailto = `mailto:garderielajoie2018@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
  window.location.href = mailto;

  // ——— Intégrations alternatives (facultatif) ———
  // TODO EmailJS
  // emailjs.init("VOTRE_PUBLIC_KEY");
  // emailjs.send("SERVICE_ID","TEMPLATE_ID",{ /* champs */ }).then(...);

  // TODO Netlify Forms
  // Ajouter name="inscriptions" sur le <form> et un input hidden form-name
});

// ——— Améliorations UX mineures ———
const telInput = document.getElementById('parentTel');
telInput?.addEventListener('input', (e) => {
  // autoriser chiffres, espace, +, -, ( )
  const v = e.target.value.replace(/[^\d+\-() ]/g,'');
  e.target.value = v;
});
