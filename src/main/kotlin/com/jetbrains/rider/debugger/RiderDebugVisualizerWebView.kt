package com.jetbrains.rider.debugger

import java.io.InputStream

object RiderDebugVisualizerWebView {
    fun getBundleFile(path: String): InputStream {
        return RiderDebugVisualizerWebView::class.java.getResourceAsStream(path)
    }
}