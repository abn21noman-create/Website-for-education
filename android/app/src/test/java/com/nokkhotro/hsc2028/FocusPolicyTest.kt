package com.nokkhotro.hsc2028

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class FocusPolicyTest {
    @Test
    fun durationBoundaryRejectsAbusiveBridgeCalls() {
        assertFalse(FocusPolicy.acceptsDuration(59))
        assertTrue(FocusPolicy.acceptsDuration(25 * 60))
        assertTrue(FocusPolicy.acceptsDuration(2 * 60 * 60))
        assertFalse(FocusPolicy.acceptsDuration(2 * 60 * 60 + 1))
    }

    @Test
    fun labelsAreBoundedAndControlCharactersAreRemoved() {
        val cleaned = FocusPolicy.cleanLabel("  Physics\u0000 chapter  ")
        assertEquals("Physics  chapter", cleaned)
        assertTrue(FocusPolicy.cleanLabel("x".repeat(500)).length <= FocusPolicy.MAX_LABEL_CHARS)
    }

    @Test
    fun onlyTheBundledHttpsOriginIsTrusted() {
        assertTrue(FocusPolicy.isTrustedAppUrl("https", FocusPolicy.APP_ASSET_HOST))
        assertFalse(FocusPolicy.isTrustedAppUrl("http", FocusPolicy.APP_ASSET_HOST))
        assertFalse(FocusPolicy.isTrustedAppUrl("https", "example.com"))
    }
}
