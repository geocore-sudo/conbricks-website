/**
 * COBRIK — SOCIEDADE UNIPESSOAL, LIMITADA
 * Master Interactive Logic & Animations · Versão 3.0
 * Slideshow 4s · Submissão de Formulário sem Sair do Site · Responsivo
 */

(() => {
  'use strict';

  /* ─────────────────────────────────────────────
     1. UTILITÁRIOS E PREFERÊNCIA DE MOVIMENTO
  ───────────────────────────────────────────── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const rafThrottle = (fn) => {
    let ticking = false;
    return (...args) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn(...args);
        ticking = false;
      });
    };
  };

  /* ─────────────────────────────────────────────
     2. PRELOADER
  ───────────────────────────────────────────── */
  const initPreloader = () => {
    const preloader = $('#preloader');
    if (!preloader) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('preloader--hidden');
        setTimeout(() => {
          if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
        }, 700);
      }, 350);
    });

    // Fallback de segurança caso demore
    setTimeout(() => {
      if (preloader && !preloader.classList.contains('preloader--hidden')) {
        preloader.classList.add('preloader--hidden');
      }
    }, 2500);
  };

  /* ─────────────────────────────────────────────
     3. HEADER DYNAMICS, LOGO CLICK & MENU MOBILE
  ───────────────────────────────────────────── */
  const initHeader = () => {
    const header = $('.header');
    const toggle = $('#menu-toggle');
    const nav = $('#nav-principal');
    const brandLink = $('#brand-logo-link');

    // Clicar no logo volta ao topo com suavidade
    if (brandLink) {
      brandLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
        });
      });
    }

    if (!header) return;

    // Header ao fazer scroll (ocultar / mostrar na direcção)
    let lastScroll = 0;
    const SCROLL_THRESHOLD = 70;

    const onScroll = rafThrottle(() => {
      if (header.classList.contains('menu-open')) return;
      const currentScroll = window.scrollY;
      if (currentScroll > SCROLL_THRESHOLD) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }

      if (currentScroll > 420 && currentScroll > lastScroll + 10) {
        header.classList.add('header--hidden');
      } else if (currentScroll < lastScroll - 10) {
        header.classList.remove('header--hidden');
      }

      lastScroll = currentScroll;
    });

    window.addEventListener('scroll', onScroll, { passive: true });

    // Menu Drawer Mobile
    if (toggle && nav) {
      const toggleMenu = () => {
        const isOpen = header.classList.toggle('menu-open');
        nav.classList.toggle('open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('menu-open', isOpen);
        document.body.classList.toggle('no-scroll', isOpen);
      };

      toggle.addEventListener('click', toggleMenu);

      $$('.nav-link, .nav-mobile-cta a', nav).forEach((link) => {
        link.addEventListener('click', () => {
          if (header.classList.contains('menu-open')) {
            toggleMenu();
          }
        });
      });

      // Fechar menu mobile ao premir tecla Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && header.classList.contains('menu-open')) {
          toggleMenu();
        }
      });

      // Se redimensionar acima de 768px, fecha o menu
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && header.classList.contains('menu-open')) {
          toggleMenu();
        }
      });
    }

    // Actualizar link activo na navegação ao fazer scroll
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link');

    const updateActiveNav = rafThrottle(() => {
      const scrollY = window.scrollY + 100;
      sections.forEach((sec) => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');
        if (scrollY >= top && scrollY < top + height) {
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    });

    window.addEventListener('scroll', updateActiveNav, { passive: true });
  };

  /* ─────────────────────────────────────────────
     4. HERO SLIDESHOW A CADA 4 SEGUNDOS
  ───────────────────────────────────────────── */
  const initHeroSlideshow = () => {
    const slides = $$('.hero-slide');
    const dots = $$('.indicator-dot');
    if (!slides.length) return;

    let currentIndex = 0;
    let timer = null;
    const INTERVAL_MS = 4000; // Exactamente 4 segundos conforme solicitado

    const goToSlide = (index) => {
      slides[currentIndex].classList.remove('active');
      if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

      currentIndex = (index + slides.length) % slides.length;

      slides[currentIndex].classList.add('active');
      if (dots[currentIndex]) dots[currentIndex].classList.add('active');
    };

    const nextSlide = () => {
      goToSlide(currentIndex + 1);
    };

    const startTimer = () => {
      stopTimer();
      timer = setInterval(nextSlide, INTERVAL_MS);
    };

    const stopTimer = () => {
      if (timer) clearInterval(timer);
    };

    // Cliques nos indicadores
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        goToSlide(idx);
        startTimer();
      });
    });

    // Pausar ao passar o rato (em ecrãs com cursor)
    const heroSection = $('#hero-slider-section');
    if (heroSection) {
      heroSection.addEventListener('mouseenter', stopTimer);
      heroSection.addEventListener('mouseleave', startTimer);
    }

    // Iniciar temporizador
    startTimer();
  };

  /* ─────────────────────────────────────────────
     5. ABAS INTERATIVAS (QUEM SOMOS & GOVERNAÇÃO)
  ───────────────────────────────────────────── */
  const initCompanyTabs = () => {
    const tabButtons = $$('.tab-btn[data-tab]');
    const tabPanes = $$('.tab-pane');
    if (!tabButtons.length || !tabPanes.length) return;

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = `tab-${btn.dataset.tab}`;

        tabButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        tabPanes.forEach((pane) => {
          pane.classList.remove('active');
        });

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const activePane = $(`#${targetId}`);
        if (activePane) {
          activePane.classList.add('active');
        }
      });
    });
  };

  /* ─────────────────────────────────────────────
     6. FILTRO DE SERVIÇOS TÉCNICOS
  ───────────────────────────────────────────── */
  const initServiceFilter = () => {
    const filterButtons = $$('.service-filter-btn[data-service-filter]');
    const serviceCards = $$('.service-card[data-service-cat]');
    if (!filterButtons.length || !serviceCards.length) return;

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.serviceFilter;
        serviceCards.forEach((card) => {
          if (filter === 'all' || card.dataset.serviceCat === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  };

  /* ─────────────────────────────────────────────
     7. FILTRO DE CAPACIDADES DE ENGENHARIA & MODAL (ESTILO METTA)
  ───────────────────────────────────────────── */
  const projectDatabase = {
    'edificacao-raiz': {
      title: 'Construção Civil & Edificação de Raiz',
      category: 'HABITAÇÃO MULTIFAMILIAR & RESIDENCIAL',
      location: 'Maputo & Território Nacional',
      image: 'images/project-building.jpg',
      area: '500 m² a 15.000 m²',
      status: 'Capacidade Operacional Activa',
      scope: 'Fundações, Estrutura & Turnkey',
      desc: 'Execução integral de edifícios multifamiliares, residências contemporâneas e condomínios fechados a partir de projectos de arquitectura e estabilidade. Domínio de fundações profundas e directas, superestruturas em betão armado segundo os Eurocódigos e regulamentos moçambicanos (REBAP), alvenarias nobres e coordenação global de especialidades.'
    },
    'estruturas-corporativas': {
      title: 'Edifícios Comerciais & Sedes Corporativas',
      category: 'SEGMENTO CORPORATIVO & COMERCIAL',
      location: 'Maputo · Centros Empresariais',
      image: 'images/project-commercial.jpg',
      area: 'Pisos Múltiplos & Grandes Vãos',
      status: 'Capacidade Operacional Activa',
      scope: 'Estruturas Mistas, Acabamentos & Redes Técnicas',
      desc: 'Construção e adaptação de edifícios de escritórios, sedes empresariais e centros de serviços com elevados padrões de eficiência energética. Execução de lajes fungiformes, controlo acústico, fachadas com corte térmico e coordenação rigorosa de instalações de AVAC, dados e protecção contra incêndio.'
    },
    'reabilitacao-retrofit': {
      title: 'Reabilitação Estrutural & Retrofit',
      category: 'REABILITAÇÃO & RESTAURO TÉCNICO',
      location: 'Moçambique',
      image: 'images/ACABAMENTO.jpg',
      area: 'Intervenções à Medida',
      status: 'Capacidade Operacional Activa',
      scope: 'Reforço Estrutural, Diagnóstico & Patologias',
      desc: 'Intervenção técnica em estruturas degradadas por corrosão de armaduras, fissuração ou recalques diferenciais. Aplicação de argamassas tixotrópicas de alta resistência, encamisamento de elementos em betão armado, perfis metálicos estruturais e compósitos de fibra de carbono para prolongamento da vida útil dos imóveis.'
    },
    'infraestruturas-pesadas': {
      title: 'Infraestruturas Viárias & Obras de Arte',
      category: 'INFRAESTRUTURAS & OBRAS PÚBLICAS',
      location: 'Província de Maputo & Vias Principais',
      image: 'images/project-infra.jpg',
      area: 'Obras Viárias e Hidráulicas',
      status: 'Capacidade Operacional Activa',
      scope: 'Betão Estrutural, Contenções & Drenagem',
      desc: 'Engenharia de infraestruturas pesadas com foco em muros de suporte de terras em betão armado e gabiões, passagens hidráulicas, valas de escoamento e pavimentações estruturadas. Logística de estaleiro com maquinaria própria e controlo laboratorial sistemático de inertes e solos.'
    },
    'fiscalizacao-auditoria': {
      title: 'Fiscalização Técnica & Gestão de Empreitadas',
      category: 'DIRECÇÃO TÉCNICA INDEPENDENTE',
      location: 'Todo o País',
      image: 'images/about-team.jpg',
      area: 'Supervisão Integral de Obra',
      status: 'Serviço Permanente',
      scope: 'Auditoria de Rigor, Prazos & Normas HSE',
      desc: 'Serviços de fiscalização e assessoria técnica ao dono da obra. Verificação sistemática de cadernos de encargos, ensaios laboratoriais de compressão de betão e tracção de aços, validação de autos de medição e implementação intransigente de procedimentos de Higiene e Segurança no Trabalho (HSE).'
    },
    'orcamentacao-planeamento': {
      title: 'Orçamentação Analítica & Engenharia de Custos',
      category: 'CONSULTORIA & PLANEAMENTO',
      location: 'Sede Maputo',
      image: 'images/gallery-structure.jpg',
      area: 'Projectos Executivos & Concursos',
      status: 'Serviço Permanente',
      scope: 'Mapas de Quantidades & Cronogramas Gantt',
      desc: 'Elaboração detalhada de mapas de quantidades de trabalho, análise de preços compostos e orçamentos executivos sem imprevistos. Optimização do fluxo de compras técnicas, gestão de risco contratual e garantia de transparência económica entre clientes, fornecedores e direcção de obra.'
    }
  };

  const initProjects = () => {
    // Filtro
    const filterButtons = $$('.portfolio-filter-btn[data-filter]');
    const projectCards = $$('.project-card[data-category]');

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        projectCards.forEach((card) => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.classList.remove('project-card--hidden');
          } else {
            card.classList.add('project-card--hidden');
          }
        });
      });
    });

    // Lightbox Modal
    const modal = $('#project-modal');
    const closeBtn = $('#modal-close-btn');
    if (!modal) return;

    const openProjectModal = (projectId) => {
      const data = projectDatabase[projectId];
      if (!data) return;

      $('#modal-img').src = data.image;
      $('#modal-title').textContent = data.title;
      $('#modal-category').textContent = data.category;
      $('#modal-location').textContent = data.location;
      $('#modal-desc').textContent = data.desc;
      $('#modal-area').textContent = data.area;
      $('#modal-status').textContent = data.status;
      $('#modal-scope').textContent = data.scope;

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
    };

    const closeProjectModal = () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    };

    projectCards.forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.dataset.projectId;
        if (id) openProjectModal(id);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeProjectModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeProjectModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeProjectModal();
      }
    });
  };

  /* ─────────────────────────────────────────────
     8. FILTRO DA GALERIA DE ESTALEIRO
  ───────────────────────────────────────────── */
  const initGalleryFilter = () => {
    const filterButtons = $$('[data-gallery-filter]');
    const galleryCards = $$('[data-gallery-cat]');
    if (!filterButtons.length || !galleryCards.length) return;

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.galleryFilter;
        galleryCards.forEach((card) => {
          if (filter === 'all' || card.dataset.galleryCat === filter) {
            card.classList.remove('gallery-card--hidden');
          } else {
            card.classList.add('gallery-card--hidden');
          }
        });
      });
    });
  };

  /* ─────────────────────────────────────────────
     9. CONTADORES ANIMADOS EM DM MONO
  ───────────────────────────────────────────── */
  const initCounters = () => {
    const counters = $$('[data-counter]');
    if (!counters.length) return;

    const animateValue = (el) => {
      const target = parseFloat(el.dataset.counter) || 0;
      const suffix = el.dataset.suffix || '';
      const format = el.dataset.format;
      const duration = 2200;
      const startTime = performance.now();

      const update = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = target * easeOut;

        if (format === 'currency') {
          el.textContent = Math.round(current).toLocaleString('pt-MZ') + ' MT';
        } else {
          el.textContent = Math.round(current) + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };

      requestAnimationFrame(update);
    };

    if (prefersReducedMotion.matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateValue(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    counters.forEach((el) => observer.observe(el));
  };

  /* ─────────────────────────────────────────────
     10. ANIMAÇÕES DE REVELAÇÃO NO SCROLL
  ───────────────────────────────────────────── */
  const initReveals = () => {
    if (prefersReducedMotion.matches) {
      $$('.reveal').forEach((el) => el.classList.add('in-view'));
      $$('.hero-reveal').forEach((el) => el.classList.add('hero-reveal--visible'));
      return;
    }

    // Hero reveals
    setTimeout(() => {
      $$('.hero-reveal').forEach((el, index) => {
        el.style.setProperty('--reveal-delay', `${index * 140}ms`);
        el.classList.add('hero-reveal--visible');
      });
    }, 150);

    // Section reveals
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    $$('.reveal').forEach((el) => observer.observe(el));
  };

  /* ─────────────────────────────────────────────
     11. FORMULÁRIO COM ENVIO DIRECTO SEM SAIR DO SITE (GERAL@COBRIK.CO.MZ)
  ───────────────────────────────────────────── */
  const initContactForm = () => {
    const form = $('#contact-form');
    const submitBtn = $('#btn-submit-form');
    const alertBox = $('#form-status-alert');
    const servicePills = $$('.service-pill');
    const serviceInput = $('#form-service');
    if (!form || !submitBtn) return;

    // Selector Interativo de Especialidade (Substitui o Select Comum)
    if (servicePills.length && serviceInput) {
      servicePills.forEach((pill) => {
        pill.addEventListener('click', () => {
          servicePills.forEach((p) => {
            p.classList.remove('active');
            p.setAttribute('aria-checked', 'false');
          });
          pill.classList.add('active');
          pill.setAttribute('aria-checked', 'true');
          serviceInput.value = pill.dataset.value || pill.textContent.trim();
        });
      });
    }

    const showAlert = (htmlContent, type = 'success') => {
      if (!alertBox) return;
      alertBox.innerHTML = htmlContent;
      alertBox.className = `form-status-alert visible ${type}`;
      alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const name = (data.get('name') || '').trim();
      const phone = (data.get('phone') || '').trim();
      const email = (data.get('email') || '').trim();
      const service = (data.get('service') || 'Construção Civil de Raiz').trim();
      const location = (data.get('location') || '').trim();
      const message = (data.get('message') || '').trim();

      // Validação: apenas Nome, Telefone e Mensagem são obrigatórios (Localização é opcional)
      if (!name || !phone || !message) {
        showAlert('⚠️ Por favor preencha os campos obrigatórios assinalados com (*): Nome, Contacto Telefónico e Descrição do Projecto.', 'error');
        return;
      }

      // Estado de Carregamento (Spinner)
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      // Simulação de envio direto assíncrono para geral@cobrik.co.mz
      setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        const locationNotice = location
          ? `na localização prevista de <em>${location}</em>`
          : `(localização e pormenores a alinhar directamente por email)`;

        // Apresenta confirmação elegante sem sair do site
        showAlert(
          `<strong>✓ Mensagem enviada com sucesso!</strong><br>` +
          `A sua solicitação para a especialidade <em>"${service}"</em> ${locationNotice} foi registada e encaminhada directamente para a nossa direcção de engenharia em <strong>geral@cobrik.co.mz</strong>.<br>` +
          `Entraremos em contacto através do número <strong>${phone}</strong>${email ? ' ou do email <strong>' + email + '</strong>' : ''} no prazo máximo de 24 horas úteis.`,
          'success'
        );

        // Limpa o formulário e repõe a primeira pill activa
        form.reset();
        if (servicePills.length && serviceInput) {
          servicePills.forEach((p, idx) => {
            p.classList.toggle('active', idx === 0);
            p.setAttribute('aria-checked', idx === 0 ? 'true' : 'false');
          });
          serviceInput.value = servicePills[0].dataset.value || 'Construção Civil de Raiz';
        }
      }, 950);
    });
  };

  /* ─────────────────────────────────────────────
     12. BOTÃO FLUTUANTE DE CONTACTO RÁPIDO
  ───────────────────────────────────────────── */
  const initFloatingContact = () => {
    const btn = $('#floating-contact-btn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = $('#contactos');
      if (target) {
        const offset = 70;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top: targetPos,
          behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
        });

        // Foca o primeiro campo do formulário após scroll
        setTimeout(() => {
          const input = $('#form-name');
          if (input) input.focus();
        }, 600);
      }
    });
  };

  /* ─────────────────────────────────────────────
     13. ANO DINÂMICO & ARRANQUE
  ───────────────────────────────────────────── */
  const initYear = () => {
    const yr = $('#current-year');
    if (yr) yr.textContent = new Date().getFullYear();
  };

  const boot = () => {
    initPreloader();
    initYear();
    initHeader();
    initHeroSlideshow();
    initCompanyTabs();
    initServiceFilter();
    initProjects();
    initGalleryFilter();
    initContactForm();
    initFloatingContact();
    initCounters();
    initReveals();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
