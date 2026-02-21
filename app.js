// ===========================================
// QR Canvas - Beautiful QR Code Generator
// by Base42 / 42.mk
// ===========================================

(function () {
  'use strict';

  // --- Dark Mode ---
  function initTheme() {
    const saved = localStorage.getItem('qrcanvas-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }
  initTheme();

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('qrcanvas-theme', next);
  }

  // --- State ---
  const state = {
    contentType: 'url',
    fgColor: '#000000',
    bgColor: '#FFFFFF',
    useGradient: false,
    gradientColor: '#0000FF',
    gradientType: 'linear',
    useCustomEyeColor: false,
    eyeFrameColor: '#000000',
    eyeBallColor: '#000000',
    bodyShape: 'square',
    eyeFrameShape: 'square',
    eyeBallShape: 'square',
    logo: null,
    logoRemoveBg: true,
    logoSize: 30,
    resolution: 1000,
    ecLevel: 'Q',
  };

  // --- Shape Definitions ---
  const bodyShapes = [
    { id: 'square', label: 'Square' },
    { id: 'rounded', label: 'Rounded' },
    { id: 'dots', label: 'Dots' },
    { id: 'classy', label: 'Classy' },
    { id: 'classy-rounded', label: 'Classy Rounded' },
    { id: 'diamond', label: 'Diamond' },
    { id: 'star', label: 'Star' },
    { id: 'fluid', label: 'Fluid' },
    { id: 'stripe', label: 'Stripe' },
    { id: 'thin', label: 'Thin' },
  ];

  const eyeFrameShapes = [
    { id: 'square', label: 'Square' },
    { id: 'rounded', label: 'Rounded' },
    { id: 'circle', label: 'Circle' },
    { id: 'classy', label: 'Classy' },
    { id: 'dotted', label: 'Dotted' },
  ];

  const eyeBallShapes = [
    { id: 'square', label: 'Square' },
    { id: 'rounded', label: 'Rounded' },
    { id: 'circle', label: 'Circle' },
    { id: 'diamond', label: 'Diamond' },
    { id: 'star', label: 'Star' },
  ];

  // --- Templates ---
  const templates = [
    { name: 'Classic', fg: '#000000', bg: '#FFFFFF', body: 'square', eyeFrame: 'square', eyeBall: 'square', gradient: false, eyeColor: false },
    { name: 'Ocean', fg: '#006994', bg: '#E0F7FA', body: 'rounded', eyeFrame: 'rounded', eyeBall: 'circle', gradient: true, gradientColor: '#00ACC1', gradientType: 'linear', eyeColor: true, eyeFrameColor: '#004D40', eyeBallColor: '#00695C' },
    { name: 'Sunset', fg: '#FF6B35', bg: '#FFF8E7', body: 'dots', eyeFrame: 'circle', eyeBall: 'circle', gradient: true, gradientColor: '#FF1744', gradientType: 'radial', eyeColor: true, eyeFrameColor: '#D84315', eyeBallColor: '#FF8F00' },
    { name: 'Forest', fg: '#2E7D32', bg: '#F1F8E9', body: 'classy', eyeFrame: 'classy', eyeBall: 'rounded', gradient: false, eyeColor: true, eyeFrameColor: '#1B5E20', eyeBallColor: '#388E3C' },
    { name: 'Royal', fg: '#4A148C', bg: '#F3E5F5', body: 'classy-rounded', eyeFrame: 'rounded', eyeBall: 'diamond', gradient: true, gradientColor: '#880E4F', gradientType: 'linear', eyeColor: true, eyeFrameColor: '#311B92', eyeBallColor: '#6A1B9A' },
    { name: 'Midnight', fg: '#1A237E', bg: '#E8EAF6', body: 'diamond', eyeFrame: 'rounded', eyeBall: 'star', gradient: true, gradientColor: '#0D47A1', gradientType: 'linear', eyeColor: false },
    { name: 'Cherry', fg: '#C62828', bg: '#FFEBEE', body: 'rounded', eyeFrame: 'circle', eyeBall: 'rounded', gradient: false, eyeColor: true, eyeFrameColor: '#B71C1C', eyeBallColor: '#E53935' },
    { name: 'Slate', fg: '#37474F', bg: '#ECEFF1', body: 'thin', eyeFrame: 'square', eyeBall: 'square', gradient: false, eyeColor: false },
    { name: 'Gold', fg: '#F57F17', bg: '#FFFDE7', body: 'fluid', eyeFrame: 'rounded', eyeBall: 'circle', gradient: true, gradientColor: '#FF6F00', gradientType: 'radial', eyeColor: true, eyeFrameColor: '#E65100', eyeBallColor: '#F9A825' },
    { name: 'Neon', fg: '#00E676', bg: '#1a1a2e', body: 'dots', eyeFrame: 'circle', eyeBall: 'circle', gradient: true, gradientColor: '#00BCD4', gradientType: 'linear', eyeColor: true, eyeFrameColor: '#76FF03', eyeBallColor: '#00E5FF' },
    { name: 'Coral', fg: '#FF5252', bg: '#FFF3E0', body: 'stripe', eyeFrame: 'rounded', eyeBall: 'rounded', gradient: true, gradientColor: '#FF4081', gradientType: 'linear', eyeColor: false },
    { name: 'Mono', fg: '#212121', bg: '#FAFAFA', body: 'square', eyeFrame: 'square', eyeBall: 'square', gradient: false, eyeColor: false },
  ];

  // --- Content Builders ---
  function getContent() {
    switch (state.contentType) {
      case 'url':
        return document.getElementById('urlInput').value || 'https://example.com';
      case 'text':
        return document.getElementById('textInput').value || 'Hello World';
      case 'email': {
        const to = document.getElementById('emailTo').value;
        const subject = document.getElementById('emailSubject').value;
        const body = document.getElementById('emailBody').value;
        let mailto = `mailto:${to}`;
        const params = [];
        if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        if (params.length) mailto += '?' + params.join('&');
        return mailto;
      }
      case 'phone':
        return `tel:${document.getElementById('phoneInput').value}`;
      case 'sms': {
        const phone = document.getElementById('smsPhone').value;
        const msg = document.getElementById('smsMessage').value;
        return msg ? `smsto:${phone}:${msg}` : `smsto:${phone}`;
      }
      case 'vcard': {
        const fn = document.getElementById('vcardFirstName').value;
        const ln = document.getElementById('vcardLastName').value;
        let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
        vcard += `N:${ln};${fn};;;\n`;
        vcard += `FN:${fn} ${ln}\n`;
        const org = document.getElementById('vcardOrg').value;
        if (org) vcard += `ORG:${org}\n`;
        const title = document.getElementById('vcardTitle').value;
        if (title) vcard += `TITLE:${title}\n`;
        const phone = document.getElementById('vcardPhone').value;
        if (phone) vcard += `TEL;TYPE=WORK,VOICE:${phone}\n`;
        const mobile = document.getElementById('vcardMobile').value;
        if (mobile) vcard += `TEL;TYPE=CELL:${mobile}\n`;
        const email = document.getElementById('vcardEmail').value;
        if (email) vcard += `EMAIL:${email}\n`;
        const url = document.getElementById('vcardUrl').value;
        if (url) vcard += `URL:${url}\n`;
        const street = document.getElementById('vcardStreet').value;
        const city = document.getElementById('vcardCity').value;
        const st = document.getElementById('vcardState').value;
        const zip = document.getElementById('vcardZip').value;
        const country = document.getElementById('vcardCountry').value;
        if (street || city || st || zip || country) {
          vcard += `ADR;TYPE=WORK:;;${street};${city};${st};${zip};${country}\n`;
        }
        vcard += 'END:VCARD';
        return vcard;
      }
      case 'mecard': {
        const fn = document.getElementById('mecardFirstName').value;
        const ln = document.getElementById('mecardLastName').value;
        let mc = `MECARD:N:${ln},${fn};`;
        const nick = document.getElementById('mecardNickname').value;
        if (nick) mc += `NICKNAME:${nick};`;
        const phone = document.getElementById('mecardPhone').value;
        if (phone) mc += `TEL:${phone};`;
        const email = document.getElementById('mecardEmail').value;
        if (email) mc += `EMAIL:${email};`;
        const url = document.getElementById('mecardUrl').value;
        if (url) mc += `URL:${url};`;
        const note = document.getElementById('mecardNote').value;
        if (note) mc += `NOTE:${note};`;
        mc += ';';
        return mc;
      }
      case 'wifi': {
        const ssid = document.getElementById('wifiSsid').value;
        const pass = document.getElementById('wifiPassword').value;
        const enc = document.getElementById('wifiEncryption').value;
        const hidden = document.getElementById('wifiHidden').checked;
        return `WIFI:T:${enc};S:${ssid};P:${pass};H:${hidden ? 'true' : ''};;`;
      }
      case 'location': {
        const lat = document.getElementById('locationLat').value;
        const lng = document.getElementById('locationLng').value;
        const query = document.getElementById('locationQuery').value;
        if (query) return `geo:${lat || 0},${lng || 0}?q=${encodeURIComponent(query)}`;
        return `geo:${lat || 0},${lng || 0}`;
      }
      case 'event': {
        const title = document.getElementById('eventTitle').value;
        const loc = document.getElementById('eventLocation').value;
        const start = document.getElementById('eventStart').value;
        const end = document.getElementById('eventEnd').value;
        const desc = document.getElementById('eventDescription').value;
        const fmt = (dt) => dt ? dt.replace(/[-:]/g, '').replace('T', 'T') + '00' : '';
        let cal = 'BEGIN:VEVENT\n';
        if (title) cal += `SUMMARY:${title}\n`;
        if (loc) cal += `LOCATION:${loc}\n`;
        if (start) cal += `DTSTART:${fmt(start)}\n`;
        if (end) cal += `DTEND:${fmt(end)}\n`;
        if (desc) cal += `DESCRIPTION:${desc}\n`;
        cal += 'END:VEVENT';
        return cal;
      }
      case 'crypto': {
        const type = document.getElementById('cryptoType').value;
        const addr = document.getElementById('cryptoAddress').value;
        const amount = document.getElementById('cryptoAmount').value;
        const msg = document.getElementById('cryptoMessage').value;
        let uri = `${type}:${addr}`;
        const params = [];
        if (amount) params.push(`amount=${amount}`);
        if (msg) params.push(`message=${encodeURIComponent(msg)}`);
        if (params.length) uri += '?' + params.join('&');
        return uri;
      }
      default:
        return 'https://example.com';
    }
  }

  // --- QR Code Generation ---
  function generateQRMatrix(text, ecLevel) {
    const typeNumber = 0; // auto
    const ecMap = { L: 'L', M: 'M', Q: 'Q', H: 'H' };
    const qr = qrcode(typeNumber, ecMap[ecLevel] || 'Q');
    qr.addData(text);
    qr.make();
    const moduleCount = qr.getModuleCount();
    const matrix = [];
    for (let row = 0; row < moduleCount; row++) {
      matrix[row] = [];
      for (let col = 0; col < moduleCount; col++) {
        matrix[row][col] = qr.isDark(row, col);
      }
    }
    return { matrix, moduleCount };
  }

  function isFinderPattern(row, col, moduleCount) {
    // Top-left
    if (row < 7 && col < 7) return true;
    // Top-right
    if (row < 7 && col >= moduleCount - 7) return true;
    // Bottom-left
    if (row >= moduleCount - 7 && col < 7) return true;
    return false;
  }

  function isEyeFrame(row, col, moduleCount) {
    // Check if position is part of the outer ring of any finder pattern
    const checks = [
      [0, 0], // top-left
      [0, moduleCount - 7], // top-right
      [moduleCount - 7, 0], // bottom-left
    ];
    for (const [sr, sc] of checks) {
      const r = row - sr;
      const c = col - sc;
      if (r >= 0 && r < 7 && c >= 0 && c < 7) {
        if (r === 0 || r === 6 || c === 0 || c === 6) return true;
        if (r === 1 || r === 5 || c === 1 || c === 5) {
          if (r >= 1 && r <= 5 && c >= 1 && c <= 5) return true;
        }
      }
    }
    return false;
  }

  function isEyeBall(row, col, moduleCount) {
    const checks = [
      [0, 0],
      [0, moduleCount - 7],
      [moduleCount - 7, 0],
    ];
    for (const [sr, sc] of checks) {
      const r = row - sr;
      const c = col - sc;
      if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
    }
    return false;
  }

  // --- Drawing Functions ---
  function drawModule(ctx, x, y, size, shape, isDark) {
    if (!isDark) return;
    const s = size;
    const pad = s * 0.05;
    switch (shape) {
      case 'rounded':
        drawRoundRect(ctx, x + pad, y + pad, s - pad * 2, s - pad * 2, s * 0.3);
        break;
      case 'dots':
        ctx.beginPath();
        ctx.arc(x + s / 2, y + s / 2, s * 0.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'classy':
        ctx.fillRect(x, y, s, s);
        // cut top-right corner
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.moveTo(x + s * 0.6, y);
        ctx.lineTo(x + s, y);
        ctx.lineTo(x + s, y + s * 0.4);
        ctx.fill();
        ctx.restore();
        break;
      case 'classy-rounded':
        drawRoundRect(ctx, x + pad, y + pad, s - pad * 2, s - pad * 2, s * 0.4);
        break;
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(x + s / 2, y + pad);
        ctx.lineTo(x + s - pad, y + s / 2);
        ctx.lineTo(x + s / 2, y + s - pad);
        ctx.lineTo(x + pad, y + s / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'star': {
        const cx = x + s / 2;
        const cy = y + s / 2;
        const outerR = s * 0.45;
        const innerR = s * 0.2;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI / 4) * i - Math.PI / 2;
          const r = i % 2 === 0 ? outerR : innerR;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'fluid':
        drawRoundRect(ctx, x + pad, y + pad, s - pad * 2, s - pad * 2, s * 0.5);
        break;
      case 'stripe':
        ctx.fillRect(x + s * 0.15, y, s * 0.7, s);
        break;
      case 'thin':
        ctx.fillRect(x + s * 0.25, y + s * 0.25, s * 0.5, s * 0.5);
        break;
      default: // square
        ctx.fillRect(x, y, s, s);
    }
  }

  function drawEyeFrame(ctx, x, y, size, moduleSize, shape, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const s = moduleSize * 7;
    const lw = moduleSize;

    switch (shape) {
      case 'rounded':
        ctx.lineWidth = lw;
        drawRoundRectStroke(ctx, x + lw / 2, y + lw / 2, s - lw, s - lw, moduleSize * 1.5);
        break;
      case 'circle':
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.arc(x + s / 2, y + s / 2, s / 2 - lw / 2, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'classy': {
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(x + lw / 2, y + s - lw / 2);
        ctx.lineTo(x + lw / 2, y + lw / 2);
        ctx.lineTo(x + s - lw / 2, y + lw / 2);
        ctx.lineTo(x + s - lw / 2, y + s - lw / 2);
        ctx.closePath();
        ctx.stroke();
        break;
      }
      case 'dotted': {
        const dotR = moduleSize * 0.4;
        const gap = moduleSize;
        for (let i = 0; i < 7; i++) {
          // top
          ctx.beginPath();
          ctx.arc(x + i * moduleSize + moduleSize / 2, y + moduleSize / 2, dotR, 0, Math.PI * 2);
          ctx.fill();
          // bottom
          ctx.beginPath();
          ctx.arc(x + i * moduleSize + moduleSize / 2, y + 6 * moduleSize + moduleSize / 2, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
        for (let i = 1; i < 6; i++) {
          // left
          ctx.beginPath();
          ctx.arc(x + moduleSize / 2, y + i * moduleSize + moduleSize / 2, dotR, 0, Math.PI * 2);
          ctx.fill();
          // right
          ctx.beginPath();
          ctx.arc(x + 6 * moduleSize + moduleSize / 2, y + i * moduleSize + moduleSize / 2, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      default: // square
        ctx.lineWidth = lw;
        ctx.strokeRect(x + lw / 2, y + lw / 2, s - lw, s - lw);
    }
    ctx.restore();
  }

  function drawEyeBall(ctx, x, y, moduleSize, shape, color) {
    ctx.save();
    ctx.fillStyle = color;
    const s = moduleSize * 3;
    const bx = x + moduleSize * 2;
    const by = y + moduleSize * 2;

    switch (shape) {
      case 'rounded':
        drawRoundRect(ctx, bx, by, s, s, moduleSize * 0.8);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(bx + s / 2, by + s / 2, s / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(bx + s / 2, by);
        ctx.lineTo(bx + s, by + s / 2);
        ctx.lineTo(bx + s / 2, by + s);
        ctx.lineTo(bx, by + s / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'star': {
        const cx = bx + s / 2;
        const cy = by + s / 2;
        const outerR = s / 2;
        const innerR = s / 4;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          const r = i % 2 === 0 ? outerR : innerR;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        break;
      }
      default: // square
        ctx.fillRect(bx, by, s, s);
    }
    ctx.restore();
  }

  function drawRoundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  function drawRoundRectStroke(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.stroke();
  }

  function createGradient(ctx, w, h, color1, color2, type) {
    let grad;
    if (type === 'radial') {
      grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    } else {
      grad = ctx.createLinearGradient(0, 0, w, h);
    }
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    return grad;
  }

  // --- Main Render ---
  function renderQR(targetCanvas, renderSize) {
    const text = getContent();
    if (!text) return;

    let qrData;
    try {
      qrData = generateQRMatrix(text, state.ecLevel);
    } catch (e) {
      console.error('QR generation error:', e);
      return;
    }

    const { matrix, moduleCount } = qrData;
    const size = renderSize || state.resolution;
    const canvas = targetCanvas || document.getElementById('qrCanvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Quiet zone
    const quietZone = 4;
    const totalModules = moduleCount + quietZone * 2;
    const moduleSize = size / totalModules;
    const offset = quietZone * moduleSize;

    // Background
    ctx.fillStyle = state.bgColor;
    ctx.fillRect(0, 0, size, size);

    // Determine fill style for body modules
    let bodyFill;
    if (state.useGradient) {
      bodyFill = createGradient(ctx, size, size, state.fgColor, state.gradientColor, state.gradientType);
    } else {
      bodyFill = state.fgColor;
    }

    // Draw body modules (non-finder-pattern areas)
    ctx.fillStyle = bodyFill;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (isFinderPattern(row, col, moduleCount)) continue;
        const x = offset + col * moduleSize;
        const y = offset + row * moduleSize;
        drawModule(ctx, x, y, moduleSize, state.bodyShape, matrix[row][col]);
      }
    }

    // Draw finder patterns (eyes)
    const eyePositions = [
      [0, 0],
      [0, moduleCount - 7],
      [moduleCount - 7, 0],
    ];

    for (const [er, ec] of eyePositions) {
      const ex = offset + ec * moduleSize;
      const ey = offset + er * moduleSize;

      // Clear the finder pattern area first
      ctx.fillStyle = state.bgColor;
      ctx.fillRect(ex, ey, moduleSize * 7, moduleSize * 7);

      // Draw eye frame
      const frameColor = state.useCustomEyeColor ? state.eyeFrameColor : (state.useGradient ? state.fgColor : state.fgColor);
      drawEyeFrame(ctx, ex, ey, moduleSize * 7, moduleSize, state.eyeFrameShape, frameColor);

      // Draw eye ball
      const ballColor = state.useCustomEyeColor ? state.eyeBallColor : (state.useGradient ? state.fgColor : state.fgColor);
      drawEyeBall(ctx, ex, ey, moduleSize, state.eyeBallShape, ballColor);
    }

    // Draw logo
    if (state.logo) {
      const logoFraction = state.logoSize / 100;
      const logoMaxSize = size * logoFraction;
      const img = state.logo;
      const aspect = img.width / img.height;
      let lw, lh;
      if (aspect > 1) {
        lw = logoMaxSize;
        lh = logoMaxSize / aspect;
      } else {
        lh = logoMaxSize;
        lw = logoMaxSize * aspect;
      }
      const lx = (size - lw) / 2;
      const ly = (size - lh) / 2;

      if (state.logoRemoveBg) {
        const pad = moduleSize * 1.5;
        ctx.fillStyle = state.bgColor;
        drawRoundRect(ctx, lx - pad, ly - pad, lw + pad * 2, lh + pad * 2, pad);
      }
      ctx.drawImage(img, lx, ly, lw, lh);
    }

    return canvas;
  }

  // --- Preview ---
  function updatePreview() {
    renderQR(document.getElementById('qrCanvas'), 600);
    checkContrast();
  }

  function checkContrast() {
    const fg = hexToRgb(state.fgColor);
    const bg = hexToRgb(state.bgColor);
    if (!fg || !bg) return;
    const ratio = contrastRatio(luminance(fg), luminance(bg));
    const warning = document.getElementById('contrastWarning');
    if (ratio < 3) {
      warning.classList.remove('hidden');
    } else {
      warning.classList.add('hidden');
    }
  }

  function hexToRgb(hex) {
    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
  }

  function luminance({ r, g, b }) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function contrastRatio(l1, l2) {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // --- SVG Generation ---
  function generateSVG() {
    const text = getContent();
    if (!text) return '';

    let qrData;
    try {
      qrData = generateQRMatrix(text, state.ecLevel);
    } catch (e) {
      return '';
    }
    const { matrix, moduleCount } = qrData;
    const quietZone = 4;
    const totalModules = moduleCount + quietZone * 2;
    const moduleSize = 10;
    const size = totalModules * moduleSize;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`;

    // Gradient defs
    if (state.useGradient) {
      svg += '<defs>';
      if (state.gradientType === 'radial') {
        svg += `<radialGradient id="qrGrad" cx="50%" cy="50%" r="50%">`;
        svg += `<stop offset="0%" stop-color="${state.fgColor}"/>`;
        svg += `<stop offset="100%" stop-color="${state.gradientColor}"/>`;
        svg += `</radialGradient>`;
      } else {
        svg += `<linearGradient id="qrGrad" x1="0%" y1="0%" x2="100%" y2="100%">`;
        svg += `<stop offset="0%" stop-color="${state.fgColor}"/>`;
        svg += `<stop offset="100%" stop-color="${state.gradientColor}"/>`;
        svg += `</linearGradient>`;
      }
      svg += '</defs>';
    }

    // Background
    svg += `<rect width="${size}" height="${size}" fill="${state.bgColor}"/>`;

    const fill = state.useGradient ? 'url(#qrGrad)' : state.fgColor;
    const offset = quietZone * moduleSize;

    // Body modules
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (isFinderPattern(row, col, moduleCount)) continue;
        if (!matrix[row][col]) continue;
        const x = offset + col * moduleSize;
        const y = offset + row * moduleSize;
        svg += getSVGModule(x, y, moduleSize, state.bodyShape, fill);
      }
    }

    // Eyes
    const eyePositions = [[0, 0], [0, moduleCount - 7], [moduleCount - 7, 0]];
    for (const [er, ec] of eyePositions) {
      const ex = offset + ec * moduleSize;
      const ey = offset + er * moduleSize;
      const frameColor = state.useCustomEyeColor ? state.eyeFrameColor : state.fgColor;
      const ballColor = state.useCustomEyeColor ? state.eyeBallColor : state.fgColor;
      svg += getSVGEyeFrame(ex, ey, moduleSize, state.eyeFrameShape, frameColor);
      svg += getSVGEyeBall(ex, ey, moduleSize, state.eyeBallShape, ballColor);
    }

    svg += '</svg>';
    return svg;
  }

  function getSVGModule(x, y, s, shape, fill) {
    const pad = s * 0.05;
    switch (shape) {
      case 'rounded':
        return `<rect x="${x + pad}" y="${y + pad}" width="${s - pad * 2}" height="${s - pad * 2}" rx="${s * 0.3}" fill="${fill}"/>`;
      case 'dots':
        return `<circle cx="${x + s / 2}" cy="${y + s / 2}" r="${s * 0.4}" fill="${fill}"/>`;
      case 'diamond':
        return `<polygon points="${x + s / 2},${y + pad} ${x + s - pad},${y + s / 2} ${x + s / 2},${y + s - pad} ${x + pad},${y + s / 2}" fill="${fill}"/>`;
      case 'classy':
        return `<path d="M${x},${y} L${x + s * 0.6},${y} L${x + s},${y + s * 0.4} L${x + s},${y + s} L${x},${y + s} Z" fill="${fill}"/>`;
      case 'classy-rounded':
        return `<rect x="${x + pad}" y="${y + pad}" width="${s - pad * 2}" height="${s - pad * 2}" rx="${s * 0.4}" fill="${fill}"/>`;
      case 'star': {
        const cx = x + s / 2, cy = y + s / 2, oR = s * 0.45, iR = s * 0.2;
        let pts = '';
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI / 4) * i - Math.PI / 2;
          const r = i % 2 === 0 ? oR : iR;
          pts += `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r} `;
        }
        return `<polygon points="${pts.trim()}" fill="${fill}"/>`;
      }
      case 'fluid':
        return `<rect x="${x + pad}" y="${y + pad}" width="${s - pad * 2}" height="${s - pad * 2}" rx="${s * 0.5}" fill="${fill}"/>`;
      case 'stripe':
        return `<rect x="${x + s * 0.15}" y="${y}" width="${s * 0.7}" height="${s}" fill="${fill}"/>`;
      case 'thin':
        return `<rect x="${x + s * 0.25}" y="${y + s * 0.25}" width="${s * 0.5}" height="${s * 0.5}" fill="${fill}"/>`;
      default:
        return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${fill}"/>`;
    }
  }

  function getSVGEyeFrame(x, y, ms, shape, color) {
    const s = ms * 7;
    const lw = ms;
    switch (shape) {
      case 'rounded':
        return `<rect x="${x + lw / 2}" y="${y + lw / 2}" width="${s - lw}" height="${s - lw}" rx="${ms * 1.5}" fill="none" stroke="${color}" stroke-width="${lw}"/>`;
      case 'circle':
        return `<circle cx="${x + s / 2}" cy="${y + s / 2}" r="${s / 2 - lw / 2}" fill="none" stroke="${color}" stroke-width="${lw}"/>`;
      case 'classy':
        return `<rect x="${x + lw / 2}" y="${y + lw / 2}" width="${s - lw}" height="${s - lw}" fill="none" stroke="${color}" stroke-width="${lw}"/>`;
      case 'dotted': {
        let dots = '';
        const r = ms * 0.4;
        for (let i = 0; i < 7; i++) {
          dots += `<circle cx="${x + i * ms + ms / 2}" cy="${y + ms / 2}" r="${r}" fill="${color}"/>`;
          dots += `<circle cx="${x + i * ms + ms / 2}" cy="${y + 6 * ms + ms / 2}" r="${r}" fill="${color}"/>`;
        }
        for (let i = 1; i < 6; i++) {
          dots += `<circle cx="${x + ms / 2}" cy="${y + i * ms + ms / 2}" r="${r}" fill="${color}"/>`;
          dots += `<circle cx="${x + 6 * ms + ms / 2}" cy="${y + i * ms + ms / 2}" r="${r}" fill="${color}"/>`;
        }
        return dots;
      }
      default:
        return `<rect x="${x + lw / 2}" y="${y + lw / 2}" width="${s - lw}" height="${s - lw}" fill="none" stroke="${color}" stroke-width="${lw}"/>`;
    }
  }

  function getSVGEyeBall(x, y, ms, shape, color) {
    const s = ms * 3;
    const bx = x + ms * 2;
    const by = y + ms * 2;
    switch (shape) {
      case 'rounded':
        return `<rect x="${bx}" y="${by}" width="${s}" height="${s}" rx="${ms * 0.8}" fill="${color}"/>`;
      case 'circle':
        return `<circle cx="${bx + s / 2}" cy="${by + s / 2}" r="${s / 2}" fill="${color}"/>`;
      case 'diamond':
        return `<polygon points="${bx + s / 2},${by} ${bx + s},${by + s / 2} ${bx + s / 2},${by + s} ${bx},${by + s / 2}" fill="${color}"/>`;
      case 'star': {
        const cx = bx + s / 2, cy = by + s / 2, oR = s / 2, iR = s / 4;
        let pts = '';
        for (let i = 0; i < 10; i++) {
          const a = (Math.PI / 5) * i - Math.PI / 2;
          const r = i % 2 === 0 ? oR : iR;
          pts += `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r} `;
        }
        return `<polygon points="${pts.trim()}" fill="${color}"/>`;
      }
      default:
        return `<rect x="${bx}" y="${by}" width="${s}" height="${s}" fill="${color}"/>`;
    }
  }

  // --- Downloads ---
  function downloadPNG() {
    const canvas = document.createElement('canvas');
    renderQR(canvas, state.resolution);
    const link = document.createElement('a');
    link.download = 'qr-canvas.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function downloadSVG() {
    const svg = generateSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = 'qr-canvas.svg';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function downloadPDF() {
    const canvas = document.createElement('canvas');
    renderQR(canvas, state.resolution);
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [100, 100],
    });
    pdf.addImage(imgData, 'PNG', 5, 5, 90, 90);
    pdf.save('qr-canvas.pdf');
  }

  // --- Shape Preview Thumbnails ---
  function createShapeSVGThumb(shape, type) {
    const s = 40;
    let svg = `<svg viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg">`;
    const thumbBg = document.documentElement.getAttribute('data-theme') === 'dark' ? '#1a222d' : '#f0f2f5';
    svg += `<rect width="${s}" height="${s}" fill="${thumbBg}"/>`;

    if (type === 'body') {
      const ms = 8;
      const positions = [[4, 4], [14, 4], [24, 4], [4, 14], [24, 14], [4, 24], [14, 24], [24, 24], [14, 14]];
      for (const [x, y] of positions) {
        svg += getSVGModule(x, y, ms, shape, '#2BEDED');
      }
    } else if (type === 'eyeFrame') {
      svg += getSVGEyeFrame(2, 2, 5, shape, '#2BEDED');
    } else if (type === 'eyeBall') {
      const ms = 5;
      svg += getSVGEyeBall(2, 2, ms, shape, '#2BEDED');
    }

    svg += '</svg>';
    return svg;
  }

  // --- Template Thumbnails ---
  function createTemplateThumbnail(template) {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;

    // Temporarily apply template to state for rendering
    const savedState = { ...state };
    applyTemplateToState(template);
    renderQR(canvas, 200);

    // Restore state
    Object.assign(state, savedState);
    return canvas;
  }

  function applyTemplateToState(t) {
    state.fgColor = t.fg;
    state.bgColor = t.bg;
    state.bodyShape = t.body;
    state.eyeFrameShape = t.eyeFrame;
    state.eyeBallShape = t.eyeBall;
    state.useGradient = t.gradient || false;
    if (t.gradient) {
      state.gradientColor = t.gradientColor || '#0000FF';
      state.gradientType = t.gradientType || 'linear';
    }
    state.useCustomEyeColor = t.eyeColor || false;
    if (t.eyeColor) {
      state.eyeFrameColor = t.eyeFrameColor || '#000000';
      state.eyeBallColor = t.eyeBallColor || '#000000';
    }
  }

  // --- UI Sync ---
  function syncUIFromState() {
    document.getElementById('fgColor').value = state.fgColor;
    document.getElementById('fgColorText').value = state.fgColor;
    document.getElementById('bgColor').value = state.bgColor;
    document.getElementById('bgColorText').value = state.bgColor;
    document.getElementById('useGradient').checked = state.useGradient;
    document.getElementById('gradientOptions').classList.toggle('hidden', !state.useGradient);
    document.getElementById('gradientColor').value = state.gradientColor;
    document.getElementById('gradientColorText').value = state.gradientColor;
    document.querySelectorAll('[name="gradientType"]').forEach(r => {
      r.checked = r.value === state.gradientType;
    });
    document.getElementById('useCustomEyeColor').checked = state.useCustomEyeColor;
    document.getElementById('eyeColorOptions').classList.toggle('hidden', !state.useCustomEyeColor);
    document.getElementById('eyeFrameColor').value = state.eyeFrameColor;
    document.getElementById('eyeFrameColorText').value = state.eyeFrameColor;
    document.getElementById('eyeBallColor').value = state.eyeBallColor;
    document.getElementById('eyeBallColorText').value = state.eyeBallColor;

    // Shape selections
    document.querySelectorAll('#bodyShapeGrid .shape-option').forEach(el => {
      el.classList.toggle('active', el.dataset.shape === state.bodyShape);
    });
    document.querySelectorAll('#eyeFrameShapeGrid .shape-option').forEach(el => {
      el.classList.toggle('active', el.dataset.shape === state.eyeFrameShape);
    });
    document.querySelectorAll('#eyeBallShapeGrid .shape-option').forEach(el => {
      el.classList.toggle('active', el.dataset.shape === state.eyeBallShape);
    });
  }

  // --- Init ---
  function init() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Build shape grids
    buildShapeGrid('bodyShapeGrid', bodyShapes, 'body', 'bodyShape');
    buildShapeGrid('eyeFrameShapeGrid', eyeFrameShapes, 'eyeFrame', 'eyeFrameShape');
    buildShapeGrid('eyeBallShapeGrid', eyeBallShapes, 'eyeBall', 'eyeBallShape');

    // Build template grid
    buildTemplateGrid();

    // Tab switching
    document.getElementById('contentTabs').addEventListener('click', e => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.contentType = tab.dataset.type;
      document.querySelectorAll('.form-panel').forEach(f => f.classList.remove('active'));
      document.querySelector(`.form-panel[data-form="${tab.dataset.type}"]`).classList.add('active');
      updatePreview();
    });

    // Color inputs
    setupColorSync('fgColor', 'fgColorText', 'fgColor');
    setupColorSync('bgColor', 'bgColorText', 'bgColor');
    setupColorSync('gradientColor', 'gradientColorText', 'gradientColor');
    setupColorSync('eyeFrameColor', 'eyeFrameColorText', 'eyeFrameColor');
    setupColorSync('eyeBallColor', 'eyeBallColorText', 'eyeBallColor');

    // Gradient toggle
    document.getElementById('useGradient').addEventListener('change', e => {
      state.useGradient = e.target.checked;
      document.getElementById('gradientOptions').classList.toggle('hidden', !e.target.checked);
      updatePreview();
    });

    // Gradient type
    document.querySelectorAll('[name="gradientType"]').forEach(r => {
      r.addEventListener('change', e => {
        state.gradientType = e.target.value;
        updatePreview();
      });
    });

    // Custom eye color toggle
    document.getElementById('useCustomEyeColor').addEventListener('change', e => {
      state.useCustomEyeColor = e.target.checked;
      document.getElementById('eyeColorOptions').classList.toggle('hidden', !e.target.checked);
      updatePreview();
    });

    // Logo upload
    const logoArea = document.getElementById('logoUploadArea');
    const logoInput = document.getElementById('logoFileInput');

    logoArea.addEventListener('click', () => logoInput.click());
    logoArea.addEventListener('dragover', e => {
      e.preventDefault();
      logoArea.classList.add('dragover');
    });
    logoArea.addEventListener('dragleave', () => logoArea.classList.remove('dragover'));
    logoArea.addEventListener('drop', e => {
      e.preventDefault();
      logoArea.classList.remove('dragover');
      if (e.dataTransfer.files[0]) handleLogoFile(e.dataTransfer.files[0]);
    });
    logoInput.addEventListener('change', e => {
      if (e.target.files[0]) handleLogoFile(e.target.files[0]);
    });

    document.getElementById('removeLogo').addEventListener('click', () => {
      state.logo = null;
      document.getElementById('logoPreview').classList.add('hidden');
      document.getElementById('logoUploadArea').classList.remove('hidden');
      updatePreview();
    });

    document.getElementById('logoRemoveBg').addEventListener('change', e => {
      state.logoRemoveBg = e.target.checked;
      updatePreview();
    });

    document.getElementById('logoSize').addEventListener('input', e => {
      state.logoSize = parseInt(e.target.value);
      document.getElementById('logoSizeValue').textContent = e.target.value;
      updatePreview();
    });

    // Resolution
    document.getElementById('resolution').addEventListener('input', e => {
      state.resolution = parseInt(e.target.value);
      document.getElementById('resolutionValue').textContent = e.target.value;
    });

    // Error correction
    document.querySelectorAll('[name="ecLevel"]').forEach(r => {
      r.addEventListener('change', e => {
        state.ecLevel = e.target.value;
        updatePreview();
      });
    });

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', updatePreview);

    // Download buttons
    document.getElementById('dlPng').addEventListener('click', downloadPNG);
    document.getElementById('dlSvg').addEventListener('click', downloadSVG);
    document.getElementById('dlPdf').addEventListener('click', downloadPDF);

    // Collapsible groups
    document.querySelectorAll('.group-title').forEach(title => {
      title.addEventListener('click', () => {
        const content = title.nextElementSibling;
        title.classList.toggle('collapsed');
        content.classList.toggle('collapsed');
      });
    });

    // Auto-update on form input changes
    document.getElementById('contentForms').addEventListener('input', debounce(updatePreview, 300));

    // Initial render
    updatePreview();
  }

  function buildShapeGrid(gridId, shapes, type, stateKey) {
    const grid = document.getElementById(gridId);
    shapes.forEach(shape => {
      const el = document.createElement('div');
      el.className = 'shape-option' + (state[stateKey] === shape.id ? ' active' : '');
      el.dataset.shape = shape.id;
      el.title = shape.label;
      el.innerHTML = createShapeSVGThumb(shape.id, type);
      el.addEventListener('click', () => {
        grid.querySelectorAll('.shape-option').forEach(o => o.classList.remove('active'));
        el.classList.add('active');
        state[stateKey] = shape.id;
        updatePreview();
      });
      grid.appendChild(el);
    });
  }

  function buildTemplateGrid() {
    const grid = document.getElementById('templateGrid');
    templates.forEach((template, idx) => {
      const el = document.createElement('div');
      el.className = 'template-option';
      el.title = template.name;
      const canvas = createTemplateThumbnail(template);
      el.appendChild(canvas);
      el.addEventListener('click', () => {
        grid.querySelectorAll('.template-option').forEach(o => o.classList.remove('active'));
        el.classList.add('active');
        applyTemplateToState(template);
        syncUIFromState();
        updatePreview();
      });
      grid.appendChild(el);
    });
  }

  function setupColorSync(colorId, textId, stateKey) {
    const colorInput = document.getElementById(colorId);
    const textInput = document.getElementById(textId);

    colorInput.addEventListener('input', e => {
      state[stateKey] = e.target.value;
      textInput.value = e.target.value;
      updatePreview();
    });

    textInput.addEventListener('input', e => {
      let val = e.target.value;
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        state[stateKey] = val;
        colorInput.value = val;
        updatePreview();
      }
    });
  }

  function handleLogoFile(file) {
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        state.logo = img;
        document.getElementById('logoPreviewImg').src = e.target.result;
        document.getElementById('logoPreview').classList.remove('hidden');
        document.getElementById('logoUploadArea').classList.add('hidden');

        // Auto-increase error correction when logo is added
        if (state.ecLevel === 'L' || state.ecLevel === 'M') {
          state.ecLevel = 'Q';
          document.querySelectorAll('[name="ecLevel"]').forEach(r => {
            r.checked = r.value === 'Q';
          });
        }

        updatePreview();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
