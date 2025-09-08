package com.holistiq.samsunghealth

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import android.content.Context
import com.samsung.android.sdk.healthdata.*
import java.util.*

class SamsungHealthModule : Module() {
  private var healthDataStore: HealthDataStore? = null
  
  private val context: Context
    get() = appContext.reactContext ?: throw Exception("React context is null")

  override fun definition() = ModuleDefinition {
    Name("SamsungHealth")

    AsyncFunction("initialize") { promise: Promise ->
      try {
        // Check if Samsung Health is available
        val healthDataService = HealthDataService()
        
        when (healthDataService.initialize(context)) {
          HealthDataService.ConnectionResult.SUCCESS -> {
            // Samsung Health is available, proceed with connection
            connectToHealthDataStore(promise)
          }
          HealthDataService.ConnectionResult.NOT_INSTALLED -> {
            promise.reject("NOT_INSTALLED", "Samsung Health is not installed", null)
          }
          HealthDataService.ConnectionResult.NOT_SUPPORTED -> {
            promise.reject("NOT_SUPPORTED", "Samsung Health is not supported on this device", null)
          }
          HealthDataService.ConnectionResult.OUTDATED_SDK -> {
            promise.reject("OUTDATED_SDK", "Samsung Health SDK is outdated", null)
          }
          else -> {
            promise.reject("UNKNOWN_ERROR", "Unknown error initializing Samsung Health", null)
          }
        }
      } catch (e: Exception) {
        promise.reject("INITIALIZATION_ERROR", "Error initializing Samsung Health: ${e.message}", e)
      }
    }

    AsyncFunction("requestPermissions") { dataTypes: List<String>, promise: Promise ->
      try {
        val healthDataStore = this@SamsungHealthModule.healthDataStore
        if (healthDataStore == null) {
          promise.reject("NOT_INITIALIZED", "Samsung Health not initialized", null)
          return@AsyncFunction
        }

        val permissionKeySet = mutableSetOf<HealthPermissionManager.PermissionKey>()
        
        dataTypes.forEach { dataType ->
          when (dataType) {
            "steps" -> {
              permissionKeySet.add(
                HealthPermissionManager.PermissionKey(
                  HealthConstants.StepCount.HEALTH_DATA_TYPE, 
                  HealthPermissionManager.PermissionType.READ
                )
              )
            }
            "heartRate" -> {
              permissionKeySet.add(
                HealthPermissionManager.PermissionKey(
                  HealthConstants.HeartRate.HEALTH_DATA_TYPE, 
                  HealthPermissionManager.PermissionType.READ
                )
              )
            }
            "sleep" -> {
              permissionKeySet.add(
                HealthPermissionManager.PermissionKey(
                  HealthConstants.Sleep.HEALTH_DATA_TYPE, 
                  HealthPermissionManager.PermissionType.READ
                )
              )
            }
            "weight" -> {
              permissionKeySet.add(
                HealthPermissionManager.PermissionKey(
                  HealthConstants.Weight.HEALTH_DATA_TYPE, 
                  HealthPermissionManager.PermissionType.READ
                )
              )
            }
          }
        }

        val permissionManager = HealthPermissionManager(healthDataStore)
        val currentActivity = appContext.currentActivity
        
        if (currentActivity == null) {
          promise.reject("NO_ACTIVITY", "No current activity available for permission request", null)
          return@AsyncFunction
        }

        permissionManager.requestPermissions(permissionKeySet, currentActivity)
          .setResultListener { result ->
            val allGranted = result.resultMap.values.all { it }
            if (allGranted) {
              promise.resolve("All permissions granted")
            } else {
              val deniedPermissions = result.resultMap.filter { !it.value }.keys
              promise.reject("PERMISSION_DENIED", "Some permissions were denied: $deniedPermissions", null)
            }
          }
      } catch (e: Exception) {
        promise.reject("PERMISSION_ERROR", "Error requesting permissions: ${e.message}", e)
      }
    }

    AsyncFunction("getStepCount") { startTime: Double, endTime: Double, promise: Promise ->
      try {
        val healthDataStore = this@SamsungHealthModule.healthDataStore
        if (healthDataStore == null) {
          promise.reject("NOT_INITIALIZED", "Samsung Health not initialized", null)
          return@AsyncFunction
        }

        val request = HealthDataResolver.ReadRequest.Builder()
          .setDataType(HealthConstants.StepCount.HEALTH_DATA_TYPE)
          .setProperties(arrayOf(
            HealthConstants.StepCount.COUNT,
            HealthConstants.StepCount.START_TIME,
            HealthConstants.StepCount.END_TIME
          ))
          .setLocalTimeRange(
            HealthConstants.StepCount.START_TIME, 
            HealthConstants.StepCount.TIME_OFFSET,
            startTime.toLong(), 
            endTime.toLong()
          )
          .build()

        HealthDataResolver(healthDataStore, null).readData(request)
          .setResultListener { result ->
            val stepData = mutableListOf<Map<String, Any>>()
            
            result.iterator().forEach { data ->
              stepData.add(mapOf(
                "count" to data.getInt(HealthConstants.StepCount.COUNT),
                "startTime" to data.getLong(HealthConstants.StepCount.START_TIME),
                "endTime" to data.getLong(HealthConstants.StepCount.END_TIME)
              ))
            }
            
            promise.resolve(stepData)
          }
      } catch (e: Exception) {
        promise.reject("READ_ERROR", "Error reading step count: ${e.message}", e)
      }
    }

    AsyncFunction("getHeartRate") { startTime: Double, endTime: Double, promise: Promise ->
      try {
        val healthDataStore = this@SamsungHealthModule.healthDataStore
        if (healthDataStore == null) {
          promise.reject("NOT_INITIALIZED", "Samsung Health not initialized", null)
          return@AsyncFunction
        }

        val request = HealthDataResolver.ReadRequest.Builder()
          .setDataType(HealthConstants.HeartRate.HEALTH_DATA_TYPE)
          .setProperties(arrayOf(
            HealthConstants.HeartRate.HEART_RATE,
            HealthConstants.HeartRate.START_TIME
          ))
          .setLocalTimeRange(
            HealthConstants.HeartRate.START_TIME, 
            HealthConstants.HeartRate.TIME_OFFSET,
            startTime.toLong(), 
            endTime.toLong()
          )
          .build()

        HealthDataResolver(healthDataStore, null).readData(request)
          .setResultListener { result ->
            val heartRateData = mutableListOf<Map<String, Any>>()
            
            result.iterator().forEach { data ->
              heartRateData.add(mapOf(
                "heartRate" to data.getFloat(HealthConstants.HeartRate.HEART_RATE),
                "timestamp" to data.getLong(HealthConstants.HeartRate.START_TIME)
              ))
            }
            
            promise.resolve(heartRateData)
          }
      } catch (e: Exception) {
        promise.reject("READ_ERROR", "Error reading heart rate: ${e.message}", e)
      }
    }
  }

  private fun connectToHealthDataStore(promise: Promise) {
    try {
      healthDataStore = HealthDataStore(context, object : HealthDataStore.ConnectionListener {
        override fun onConnected() {
          promise.resolve("Samsung Health connected successfully")
        }

        override fun onConnectionFailed(error: HealthConnectionErrorResult) {
          promise.reject("CONNECTION_FAILED", "Failed to connect to Samsung Health: ${error.errorCode}", null)
        }

        override fun onDisconnected() {
          // Handle disconnection if needed
        }
      })

      healthDataStore?.connectService()
    } catch (e: Exception) {
      promise.reject("CONNECTION_ERROR", "Error connecting to Samsung Health: ${e.message}", e)
    }
  }
}