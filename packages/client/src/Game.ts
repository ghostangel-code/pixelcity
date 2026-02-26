import { Application, Container } from 'pixi.js';

export class Game {
  private app: Application;
  private mainContainer: Container;
  
  constructor(app: Application) {
    this.app = app;
    this.mainContainer = new Container();
  }
  
  async init(): Promise<void> {
    this.app.stage.addChild(this.mainContainer);
    
    console.log('PixelCity Game initialized');
  }
}
