<?php

namespace Symplate\Support\Traits;

use Throwable;
use Exception;

/**
 * The Singleton trait provides a way to implement
 * the Singleton design pattern in classes.
 */
trait Singleton
{
    /**
     * @var array Stores instances of classes using the Singleton trait.
     */
    private static array $instances = [];

    /**
     * Protected constructor to prevent direct instantiation.
     */
    protected function __construct()
    {
        // Prevent direct instantiation.
        // Override in the class if needed.
    }

    /**
     * Get the singleton instance of the class.
     *
     * @return static
     */
    public static function getInstance(): static
    {
        $className = static::class;

        if (!isset(self::$instances[$className])) {
            self::$instances[$className] = new static();

            if (method_exists(self::$instances[$className], 'init')) {
                try {
                    self::$instances[$className]->init();
                } catch (Throwable $e) {
                    error_log("Error initializing {$className}: " . $e->getMessage());
                }
            }
        }

        return self::$instances[$className];
    }

    // public function getInstances()
    // {
    //     return self::$instances;
    // }

    /**
     * Destroy the singleton instance of the class.
     *
     * @return void
     */
    public function destroyInstance(): void
    {
        static::destroy();
    }

    /**
     * Private static method to destroy the instance.
     *
     * @return void
     */
    private static function destroy(): void
    {
        $className = static::class;

        if (isset(self::$instances[$className])) {
            unset(self::$instances[$className]);
        }
    }

    /**
     * Prevent cloning of the instance.
     *
     * @throws \Exception
     */
    private function __clone()
    {
        throw new Exception("Cloning of Singleton instances is not allowed.");
    }

    /**
     * Prevent unserializing of the instance.
     *
     * @throws \Exception
     */
    public function __wakeup()
    {
        throw new Exception("Unserializing of Singleton instances is not allowed.");
    }
}
