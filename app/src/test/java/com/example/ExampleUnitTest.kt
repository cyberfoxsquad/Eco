package com.example

import com.example.data.remote.GeminiWasteClassifier
import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Test

class ExampleUnitTest {
  @Test
  fun addition_isCorrect() {
    assertEquals(4, 2 + 2)
  }

  @Test
  fun testWasteClassification_includesSearchGroundingData() = runBlocking {
    val classifier = GeminiWasteClassifier()
    val result = classifier.classifyWasteImage(null, "banana peel")

    assertTrue("Result should be search grounded", result.isSearchGrounded)
    assertTrue("Search queries should not be empty", result.searchQueries.isNotEmpty())
    assertTrue("Search sources should not be empty", result.searchSources.isNotEmpty())
    assertNotNull("Search summary should be provided", result.searchSummary)
    assertEquals("Biodegradable", result.wasteType)
  }

  @Test
  fun testEWasteClassification_includesSearchGroundingData() = runBlocking {
    val classifier = GeminiWasteClassifier()
    val result = classifier.classifyWasteImage(null, "lithium battery")

    assertTrue("Result should be search grounded", result.isSearchGrounded)
    assertEquals("Non-Biodegradable", result.wasteType)
    assertTrue("SubCategory should be hazardous e-waste", result.subCategory.contains("E-Waste", ignoreCase = true))
    assertTrue("Directives should cite rules", result.searchSources.any { it.title.contains("E-Waste", ignoreCase = true) })
  }
}

