const cliProgress = require("cli-progress");

class Progress {
  constructor() {
    this.bar = new cliProgress.SingleBar(
      {},
      cliProgress.Presets.shades_classic
    );
  }

  start(total) {
    this.bar.start(total, 0);
  }

  update(value) {
    this.bar.update(value);
  }

  stop() {
    this.bar.stop();
  }
}
