class ProfileInfo {
  constructor(info = {}) {
    this.info = this.isPlainObject(info) ? info : {};
  }

  static getDefaults() {
    return {
      firstName: "Imie...",
      lastName: "Nazwisko...",
    };
  }

  withDefaults() {
    const defaults = ProfileInfo.getDefaults();

    return {
      ...this.info,
      firstName: this.getValueOrDefault(this.info.firstName, defaults.firstName),
      lastName: this.getValueOrDefault(this.info.lastName, defaults.lastName),
    };
  }

  validateRequired() {
    const { firstName, lastName } = this.info;

    if (typeof firstName !== "string" || typeof lastName !== "string") {
      throw new Error("Imie i nazwisko sa wymagane");
    }

    const normalizedInfo = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };

    if (!normalizedInfo.firstName || !normalizedInfo.lastName) {
      throw new Error("Imie i nazwisko sa wymagane");
    }

    return normalizedInfo;
  }

  isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  getValueOrDefault(value, defaultValue) {
    return typeof value === "string" && value.trim() ? value : defaultValue;
  }
}

module.exports = ProfileInfo;
