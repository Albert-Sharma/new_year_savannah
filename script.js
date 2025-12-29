// Smooth scroll offset for sticky header
(function() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (targetId.length > 1) {
        const el = document.querySelector(targetId);
        if (el) {
          e.preventDefault();
          const top = el.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });
})();

// Wishes textarea word limit (200 words)
(function() {
  const textarea = document.getElementById('wishesText');
  const counter = document.getElementById('wordCount');
  const error = document.getElementById('wishesError');
  if (!textarea) return;

  function updateCount() {
    const words = textarea.value.trim().split(/\s+/).filter(Boolean);
    const count = words.length;
    counter.textContent = `${count} / 200 words`;
    if (count > 200) {
      error.textContent = 'Limit is 200 words. Please shorten your message.';
      textarea.setCustomValidity('Too many words');
    } else {
      error.textContent = '';
      textarea.setCustomValidity('');
    }
  }
  textarea.addEventListener('input', updateCount);
  updateCount();
})();

// YouTube Iframe API: show black overlay when video ends
(function() {
  const iframe = document.getElementById('promo-video');
  const overlay = document.getElementById('video-overlay');
  if (!iframe || !overlay) return;

  // Load YouTube Iframe API if not already present
  if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }

  function onPlayerReady() {
    // nothing for now
  }

  function onPlayerStateChange(event) {
    // 0 = ended
    if (event.data === 0) {
      overlay.classList.add('is-visible');
    }
  }

  function tryInitPlayer() {
    if (!window.YT || !window.YT.Player) {
      setTimeout(tryInitPlayer, 100);
      return;
    }
    new YT.Player('promo-video', {
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
  }

  tryInitPlayer();
})();

// Details form validation and submit logging
(function() {
  const form = document.getElementById('details-form');
  const firm = document.getElementById('firmName');
  const dealer = document.getElementById('dealerName');
  const mobile = document.getElementById('mobileNumber');
  const address = document.getElementById('firmAddress');
  const errorBox = document.getElementById('formError');
  if (!form) return;

  // Supabase REST config - replace with your project values
  const SUPABASE_URL = 'https://cplakiyjsasgymypkxkj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwbGFraXlqc2FzZ3lteXBreGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NDc3NTAsImV4cCI6MjA3NTMyMzc1MH0.rk6T36i7hlrlsdQ-IgGNo0r0UYkNyqKzWihRRgF8Xe0';
  const SUPABASE_TABLE = 'submissions'; // change to your table name

  // Test database connection on page load
  async function testDatabaseConnection() {
    try {
      console.log('Testing Supabase connection...');
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=count`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (resp.ok) {
        console.log('✅ Database connection successful');
        return true;
      } else {
        console.error('❌ Database connection failed:', resp.status, await resp.text());
        return false;
      }
    } catch (err) {
      console.error('❌ Database connection error:', err);
      return false;
    }
  }

  // Test connection when page loads
  testDatabaseConnection();

  function isValidMobile(value) {
    return /^\d{10}$/.test(value);
  }

  mobile.addEventListener('input', () => {
    // Remove any non-digits, keep max 10
    const digits = mobile.value.replace(/\D/g, '').slice(0, 10);
    mobile.value = digits;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.textContent = '';

    const data = {
      firmName: firm.value.trim(),
      dealerName: dealer.value.trim(),
      mobileNumber: mobile.value.trim(),
      firmAddress: (address?.value || '').trim(),
      wishesText: (document.getElementById('wishesText')?.value || '').trim()
    };

    if (!data.firmName || !data.dealerName) {
      errorBox.textContent = 'Please fill firm and dealer names.';
      return;
    }
    if (!data.firmAddress) {
      errorBox.textContent = 'Please enter the firm address.';
      return;
    }
    if (!isValidMobile(data.mobileNumber)) {
      errorBox.textContent = 'Please enter a valid 10-digit mobile number.';
      return;
    }

    // Send to Supabase REST
    try {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error('Supabase config not set');
      }
      
      // Fix: Send single object, not array
      const payload = {
        firm_name: data.firmName,
        dealer_name: data.dealerName,
        mobile_number: data.mobileNumber,
        firm_address: data.firmAddress,
        wishes_text: data.wishesText,
        created_at: new Date().toISOString()
      };
      
      console.log('Sending data to Supabase:', payload);
      
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', resp.status);
      console.log('Response headers:', resp.headers);

      if (!resp.ok) {
        const errText = await resp.text();
        console.error('Supabase error response:', errText);
        throw new Error(`Database error: ${errText || `Request failed with ${resp.status}`}`);
      }
      
      const result = await resp.json();
      console.log('Supabase insert result:', result);

      // Success feedback
      form.reset();
      const wc = document.getElementById('wordCount');
      if (wc) wc.textContent = '0 / 200 words';
      alert('Thank you! Your details have been recorded.');
    } catch (err) {
      console.error('Full error details:', err);
      errorBox.textContent = `Submission failed: ${err.message}. Please check console for details.`;
    }
  });
})();

// Minimal fireworks animation on Section 3 canvas
(function() {
  const canvas = document.getElementById('fireworks');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, rafId;

  function resize() {
    width = canvas.clientWidth; height = canvas.clientHeight;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const sparks = [];
  function spawnFirework() {
    const x = Math.random() * width * 0.8 + width * 0.1;
    const y = Math.random() * height * 0.4 + height * 0.2;
    const hue = Math.floor(25 + Math.random() * 50); // warm hues
    const count = 24 + Math.floor(Math.random() * 18);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 1 + Math.random() * 2.6;
      sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, hue });
    }
  }

  function frame() {
    ctx.clearRect(0, 0, width, height);
    // Add faded glow bg
    ctx.fillStyle = 'rgba(255, 240, 194, 0.35)';
    ctx.fillRect(0, 0, width, height);

    // Update sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.99;
      s.vy = s.vy * 0.99 + 0.02; // gravity
      s.life -= 0.012;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(s.x, s.y, Math.max(0.5, 2 * s.life), 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 90%, 55%, ${s.life})`;
      ctx.fill();
    }

    // Occasionally spawn a new firework
    if (Math.random() < 0.04) spawnFirework();
    rafId = requestAnimationFrame(frame);
  }
  frame();

  // Pause when section not in view
  const section = document.getElementById('diwali');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!rafId) frame();
      } else {
        cancelAnimationFrame(rafId);
        rafId = undefined;
      }
    });
  }, { threshold: 0.15 });
  if (section) observer.observe(section);
})();


