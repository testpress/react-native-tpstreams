package com.tpstreams

object LicenseDurationUtils {
    const val DEFAULT_LICENSE_EXPIRY_SECONDS = 15L * 24 * 60 * 60 // 15 days

    fun sanitize(value: Long?): Long {
        if (value == null || value <= 0L) {
            return DEFAULT_LICENSE_EXPIRY_SECONDS
        }
        return minOf(value, DEFAULT_LICENSE_EXPIRY_SECONDS)
    }
}
