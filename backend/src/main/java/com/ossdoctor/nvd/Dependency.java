package com.ossdoctor.nvd;

import java.util.Objects;

public class Dependency {
    public enum Eco { MAVEN, NPM, PYPI, GENERIC }

    private final Eco eco;
    private final String name;    // maven: groupId:artifactId, npm: @scope/name or name, pypi: project name
    private final String version; // resolved version (lockfile 기준 권장)

    public Dependency(Eco eco, String name, String version) {
        this.eco = eco;
        this.name = name;
        this.version = version;
    }

    public Eco getEco() { return eco; }
    public String getName() { return name; }
    public String getVersion() { return version; }

    @Override public String toString() {
        return eco + ":" + name + ":" + version;
    }
    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Dependency)) return false;
        Dependency that = (Dependency) o;
        return eco == that.eco && Objects.equals(name, that.name) && Objects.equals(version, that.version);
    }
    @Override public int hashCode() {
        return Objects.hash(eco, name, version);
    }
}
