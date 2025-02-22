
export const debounce = (func, delay) => {
  let timerId; 
  return (...args) => {
    clearTimeout(timerId); 
    timerId = setTimeout(() => {
        func.apply(this, args); 
    }, delay);
  };
};



export class TextSplitter {
 
  constructor(textElement, options = {}) {
    if (!textElement || !(textElement instanceof HTMLElement)) {
      throw new Error('Invalid text element provided.');
    }

    const { resizeCallback, splitTypeTypes } = options;
    
    this.textElement = textElement;
    this.onResize = typeof resizeCallback === 'function' ? resizeCallback : null;
    
    
    const splitOptions = splitTypeTypes ? { types: splitTypeTypes } : {};
    this.splitText = new SplitType(this.textElement, splitOptions);

    if (this.onResize) {
      this.initResizeObserver(); 
    }
  }

  initResizeObserver() {
    this.previousContainerWidth = null; 

    let resizeObserver = new ResizeObserver(
      debounce((entries) => this.handleResize(entries), 100)
    );
    resizeObserver.observe(this.textElement);
  }

  handleResize(entries) {
    const [{ contentRect }] = entries;
    const width = Math.floor(contentRect.width);
    if ( this.previousContainerWidth && this.previousContainerWidth !== width ) {
      this.splitText.split(); 
      this.onResize(); 
    }
    this.previousContainerWidth = width;
  }

  // Reset text
  revert() {
    return this.splitText.revert();
  }

  getLines() {
    return this.splitText.lines;
  }

  getWords() {
    return this.splitText.words;
  }

  getChars() {
    return this.splitText.chars;
  }
}


const lettersAndSymbols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '!', '@', '#', '$', '%', '^', '&', '*', '-', '_', '+', '=', ';', ':', '<', '>', ','];

// Defines a class to create hover effects on text.
export class TextAnimator {
  constructor(textElement) {
    // Check if the provided element is valid.
    if (!textElement || !(textElement instanceof HTMLElement)) {
      throw new Error('Invalid text element provided.');
    }

    this.textElement = textElement;
    this.splitText();
  }

  splitText() {
    // Split text for animation and store the reference.
    this.splitter = new TextSplitter(this.textElement, {
      splitTypeTypes: 'words, chars'
    });

    // Save the initial state of each character
    this.originalChars = this.splitter.getChars().map(char => char.innerHTML);
  }

  animate() {
    // Reset any ongoing animations
    this.reset();

    // Query all individual characters in the line for animation.
    const chars = this.splitter.getChars();

    chars.forEach((char, position) => {
      let initialHTML = char.innerHTML;
      let repeatCount = 0;
      
      gsap.fromTo(char, {
        opacity: 0
      },
      {
        duration: 0.03,
        onStart: () => {
          // Set --opa to 1 at the start of the animation
          gsap.set(char, { '--opa': 1 });
        },
        onComplete: () => {
          gsap.set(char, {innerHTML: initialHTML, delay: 0.03})
        },
        repeat: 3,
        onRepeat: () => {
          repeatCount++;
          if (repeatCount === 1) {
            // Set --opa to 0 after the first repeat
            gsap.set(char, { '--opa': 0 });
          }
        },
        repeatRefresh: true,
        repeatDelay: 0.04,
        delay: (position+1)*0.07,
        innerHTML: () => lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)],
        opacity: 1
      });
    });
  }

  reset() {
    // Reset the text to its original state
    const chars = this.splitter.getChars();
    chars.forEach((char, index) => {
      gsap.killTweensOf(char); // Ensure no ongoing animations
      char.innerHTML = this.originalChars[index];
    });
  }
}



const init = () => {
  document.querySelectorAll('.list__item').forEach(item => {
    const cols = Array.from(item.querySelectorAll('.hover-effect'));
    const animators = cols.map(col => new TextAnimator(col));

    item.addEventListener('mouseenter', () => {
      animators.forEach(animator => animator.animate());
    });
  });

  // Same for all links
  document.querySelectorAll('a.hover-effect').forEach(item => {
    const animator = new TextAnimator(item);
    item.addEventListener('mouseenter', () => {
      animator.animate();
    });
  });
};

init();