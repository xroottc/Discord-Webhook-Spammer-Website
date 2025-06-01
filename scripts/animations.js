/**
 * Animations/visual effects for spammer
 */

export function initAnimations() {
  initButtonEffects();
  
  initInputEffects();
  
  initScrollAnimations();
  
  initLogoAnimation();
}

function initButtonEffects() {
  const buttons = document.querySelectorAll('button');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      if (button.classList.contains('primary-button')) {
        button.style.transform = 'translateY(-2px)';
      }
    });
    
    button.addEventListener('mouseleave', () => {
      if (button.classList.contains('primary-button')) {
        button.style.transform = '';
      }
    });
    
    button.addEventListener('click', () => {
      if (button.disabled) return;
      
      if (button.classList.contains('primary-button') || 
          button.classList.contains('secondary-button')) {
        createRippleEffect(button);
      }
    });
  });
}

function createRippleEffect(button) {
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  ripple.className = 'ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  
  button.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

function initInputEffects() {
  const inputs = document.querySelectorAll('input, textarea');
  
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('input-focused');
    });
    
    input.addEventListener('blur', () => {
      input.parentElement.classList.remove('input-focused');
    });
    
    input.addEventListener('invalid', () => {
      input.classList.add('error-shake');
      setTimeout(() => {
        input.classList.remove('error-shake');
      }, 500);
    });
  });
}

function initScrollAnimations() {
  if ('IntersectionObserver' in window) {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, options);
    
    document.querySelectorAll('.card').forEach(card => {
      observer.observe(card);
    });
  } else {
    document.querySelectorAll('.card').forEach(card => {
      card.classList.add('fade-in');
    });
  }
}

function initLogoAnimation() {
  const logo = document.querySelector('.logo-text');
  
  logo.addEventListener('mouseenter', () => {
    logo.classList.add('logo-shine');
  });
  
  logo.addEventListener('mouseleave', () => {
    logo.classList.remove('logo-shine');
  });
  
  logo.addEventListener('click', () => {
    logo.classList.add('pulse');
    setTimeout(() => {
      logo.classList.remove('pulse');
    }, 1500);
  });
}

function addRippleStyle() {
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      .ripple {
        position: absolute;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      }
      
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

addRippleStyle();
