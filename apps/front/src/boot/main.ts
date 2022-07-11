import { boot } from 'quasar/wrappers';
import 'src/libs/fss';
import * as PIXI from 'pixi.js';
export default boot(({ app }) => {
  // eslint:disable-next-line
  // window.PIXI = PIXI
  console.log(app);
});
