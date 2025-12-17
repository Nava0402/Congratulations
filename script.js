document.addEventListener('DOMContentLoaded', () => {
	const btn = document.getElementById('main-btn');
	const audioEl = document.getElementById('celebration-audio');
	let audioCtx;
	let _animateTimer = null;

	function playSynth() {
		if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		if (audioCtx.state === 'suspended') audioCtx.resume();

		const now = audioCtx.currentTime;
		const freqs = [660, 880, 990];
		const noteDur = 0.16;

		freqs.forEach((f, i) => {
			const osc = audioCtx.createOscillator();
			const gain = audioCtx.createGain();

			osc.type = 'sine';
			osc.frequency.setValueAtTime(f, now + i * noteDur * 0.9);

			gain.gain.setValueAtTime(0, now + i * noteDur * 0.9);
			gain.gain.linearRampToValueAtTime(0.15, now + i * noteDur * 0.9 + 0.01);
			gain.gain.exponentialRampToValueAtTime(0.001, now + i * noteDur * 0.9 + noteDur - 0.03);

			osc.connect(gain);
			gain.connect(audioCtx.destination);

			osc.start(now + i * noteDur * 0.9);
			osc.stop(now + i * noteDur * 0.9 + noteDur);
		});
	}

	function _stopTyping(el){
		if (!el) return;
		if (el._typingInterval) {
			clearInterval(el._typingInterval);
			el._typingInterval = null;
		}
		const cursor = el.querySelector('.typing-cursor');
		if (cursor) cursor.remove();
		el.textContent = '';
		el.classList.remove('typing');
	}

	function resetMessageArea(){
		if (!msgArea) return;
	
		if (_animateTimer) {
			clearTimeout(_animateTimer);
			_animateTimer = null;
		}
		msgArea.classList.remove('animate-in');
		const titleEl = document.getElementById('message-title');
		const msgText = document.getElementById('message-text');
		_stopTyping(titleEl);
		_stopTyping(msgText);
		
		msgArea.classList.add('hidden');
		setTimeout(() => msgArea.classList.remove('hidden'), 10);
	}
	if (!btn) return;

	const msgArea = document.getElementById('message-area');

	function typeWriter(el, text, speed = 24, onDone){
		if (!el) return;

		if (el._typingInterval) clearInterval(el._typingInterval);
		el.classList.add('typing');
		el.textContent = '';
		const cursor = document.createElement('span');
		cursor.className = 'typing-cursor';
		el.appendChild(cursor);
		let i = 0;
		el._typingInterval = setInterval(() => {
			if (i >= text.length){
				clearInterval(el._typingInterval);
				el._typingInterval = null;
				if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
				el.classList.remove('typing');
				if (typeof onDone === 'function') onDone();
				return;
			}
			cursor.insertAdjacentText('beforebegin', text.charAt(i));
			i++;
		}, speed);
	}

	function showMessageArea(){
		if (!msgArea) return;
		msgArea.classList.remove('hidden');
		msgArea.setAttribute('aria-hidden','false');
		
		msgArea.classList.add('animate-in');
		const titleEl = document.getElementById('message-title');
		const msgText = document.getElementById('message-text');
		const titleOriginal = titleEl && (titleEl.dataset.original || titleEl.textContent) || '';
		const msgOriginal = msgText && (msgText.dataset.original || msgText.textContent) || '';
		if (titleEl){
			
			titleEl.scrollIntoView({behavior:'smooth', block:'center'});
			typeWriter(titleEl, titleOriginal, 36, () => {
				setTimeout(() => { if (msgText) typeWriter(msgText, msgOriginal, 40); }, 180);
			});
		} else if (msgText){
			setTimeout(() => typeWriter(msgText, msgOriginal, 40), 420);
		}
		
		if (_animateTimer) clearTimeout(_animateTimer);
		_animateTimer = setTimeout(() => {
			msgArea.classList.remove('animate-in');
			_animateTimer = null;
		}, 1200);
	}

	btn.addEventListener('click', () => {
		
		resetMessageArea();
		setTimeout(() => {
			showMessageArea();
			if (audioEl) {
				audioEl.currentTime = 0;
				audioEl.play().catch((err) => {
					console.warn('Playback failed, using synth fallback:', err);
					playSynth();
				});
			} else {
				playSynth();
			}
		}, 20);
	});
});

