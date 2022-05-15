import querystring from 'query-string';
import { PongGame } from '../PongGame';
import { Lib, Renderer, ClientEngine } from 'lance-gg';
import { PongClientEngine } from '../PongClientEngine'
const qsOptions = querystring.parse(location.search);

// default options, overwritten by query-string options
// is sent to both game engine and client engine
const defaults = {
    traceLevel: Lib.Trace.TRACE_NONE,
    delayInputCount: 3,
    scheduler: 'render-schedule',
    syncOptions: {
        sync: qsOptions.sync || 'extrapolate',
        remoteObjBending: 0.8,
        bendingIncrements: 6
    }
};
let options = Object.assign(defaults, qsOptions);

// create a client engine and a game engine
const gameEngine = new PongGame(options);
// const clientEngine = new ClientEngine(gameEngine, options, Renderer);
const clientEngine = new PongClientEngine(gameEngine, options);

document.addEventListener('DOMContentLoaded', function (e) { clientEngine.start(); });
