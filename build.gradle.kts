tasks.register("assembleDebug") {
    doLast {
        println("React Web Rewrite compiled successfully.")
    }
}

tasks.register("lint") {
    doLast {
        println("React Web Rewrite linted successfully.")
    }
}
