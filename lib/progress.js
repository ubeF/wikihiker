const cliProgress = require("cli-progress");

class Progress {
  createBar(end, level) {
    this.bar = new cliProgress.SingleBar(
      {
        format: `Pages searched on level ${level} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}`
      },
      cliProgress.Presets.shades_classic
    );

    this.bar.start(end, 0);
  }

  increment(count) {
    this.bar.increment(count);
  }

  stop() {
    this.bar.stop();
  }
}

module.exports = { Progress };
