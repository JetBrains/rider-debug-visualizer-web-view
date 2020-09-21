plugins {
    id("com.gradle.plugin-publish") version "0.10.1"
    id("me.filippov.gradle.jvm.wrapper") version("0.9.2")
    kotlin("jvm") version "1.4.10"
    `maven-publish`
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(kotlin("stdlib"))
}

val yarnInstall by tasks.registering(Exec::class) {
    workingDir = project.projectDir
    commandLine = listOf("yarn", "install", "--frozen-lockfile")
}

val yarnBuild by tasks.registering(Exec::class) {
    dependsOn(yarnInstall)
    workingDir = project.projectDir
    commandLine = listOf("yarn", "run", "build")
}

tasks.jar {
    dependsOn(yarnBuild)
    from("dist") {
        include("**/*")
        exclude("**/*.map")
    }
}

publishing {
    publications {
        create<MavenPublication>("maven") {
            groupId = "org.jetbrains.rider"
            artifactId = "rider-debug-visualizer-web-view"

            from(components["java"])
        }
    }
    repositories {
        maven {
            url = uri("$buildDir/repo")
        }
    }
}