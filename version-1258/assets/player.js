import { H as Hls } from './hls-dru42stk.js';

function setupPlayers() {
  const players = document.querySelectorAll('.hls-player[data-hls]');

  players.forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('.player-overlay');
    const message = player.querySelector('.player-message');
    const source = player.dataset.hls;
    let hlsInstance = null;
    let initialized = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function initialize() {
      if (initialized || !video || !source) {
        return;
      }

      initialized = true;
      setMessage('正在初始化播放源…');

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          setMessage('播放源已就绪');
        });
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          if (data && data.fatal) {
            setMessage('播放源加载失败，请稍后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setMessage('播放源已就绪');
      } else {
        setMessage('当前浏览器不支持 HLS 播放');
      }
    }

    async function play() {
      initialize();

      try {
        await video.play();
        player.classList.add('is-playing');
        setMessage('');
      } catch (error) {
        setMessage('请再次点击播放器或检查浏览器自动播放设置');
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', () => player.classList.add('is-playing'));
      video.addEventListener('pause', () => player.classList.remove('is-playing'));
      video.addEventListener('click', initialize, { once: true });
    }

    window.addEventListener('pagehide', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
}

setupPlayers();
