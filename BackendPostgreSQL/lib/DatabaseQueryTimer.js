class DatabaseQueryTimer {
  static async measure(operationName, queryCallback) {
    const start = process.hrtime.bigint();

    try {
      return await queryCallback();
    } finally {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1_000_000;

      console.log(
        `[PostgreSQL][DB] ${operationName} - ${durationMs.toFixed(2)} ms`,
      );
    }
  }
}

module.exports = DatabaseQueryTimer;
