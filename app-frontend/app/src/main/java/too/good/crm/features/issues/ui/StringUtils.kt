package too.good.crm.features.issues.ui

/**
 * String utility functions for the issues UI package
 */

/**
 * Capitalizes the first character of the string
 */
internal fun String.capitalizeFirstChar(): String {
    return this.replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }
}

