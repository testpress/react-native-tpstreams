import Foundation

enum LicenseDurationUtils {
    static let DEFAULT_LICENSE_EXPIRY_SECONDS: Double = 15 * 24 * 60 * 60 // 15 days

    static func sanitize(_ value: Double) -> Double {
        guard value > 0 else { return DEFAULT_LICENSE_EXPIRY_SECONDS }
        return min(value, DEFAULT_LICENSE_EXPIRY_SECONDS)
    }
}
