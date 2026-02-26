import { Application } from 'pixi.js';
import { Game } from './Game';

async function main() {
  const app = new Application();
  
  await app.init({
    background: '#1a1a2e',
    resizeTo: window,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  
  document.getElementById('app')!.appendChild(app.canvas);
  
  const game = new Game(app);
  await game.init();
}

main().catch(console.error);
