/**
 * TPT Asset Editor Desktop - Database Error
 * Errors related to database operations
 */

const BaseError = require('./base-error');

class DatabaseError extends BaseError {
    constructor(message, operation = null, collection = null, query = null, details = {}) {
        super(message, 'DATABASE_ERROR', 500, {
            operation,
            collection,
            query,
            ...details
        });

        this.operation = operation;
        this.collection = collection;
        this.query = query;
    }

    /**
     * Create error for connection failure
     */
    static connectionFailed(reason, details = {}) {
        return new DatabaseError(
            `Database connection failed: ${reason}`,
            'connect',
            null,
            null,
            { reason, ...details }
        ).withUserMessage('Unable to connect to database. Please check your connection settings.');
    }

    /**
     * Create error for query failure
     */
    static queryFailed(operation, collection, query, reason, details = {}) {
        return new DatabaseError(
            `Database query failed: ${operation} on ${collection}`,
            operation,
            collection,
            query,
            { reason, ...details }
        ).withUserMessage('Database operation failed. Please try again.');
    }

    /**
     * Create error for document not found
     */
    static documentNotFound(collection, id, query = null) {
        return new DatabaseError(
            `Document not found in ${collection}: ${id}`,
            'find',
            collection,
            query,
            { documentId: id }
        ).withUserMessage('The requested item could not be found.');
    }

    /**
     * Create error for duplicate key
     */
    static duplicateKey(collection, field, value, details = {}) {
        return new DatabaseError(
            `Duplicate key error in ${collection}: ${field} = ${value}`,
            'insert',
            collection,
            null,
            { field, value, ...details }
        ).withUserMessage(`An item with this ${field} already exists.`);
    }

    /**
     * Create error for validation failure
     */
    static validationFailed(collection, document, validationErrors = []) {
        return new DatabaseError(
            `Document validation failed in ${collection}`,
            'validate',
            collection,
            null,
            { document, validationErrors }
        ).withUserMessage('The data provided is invalid. Please check your input.');
    }

    /**
     * Create error for transaction failure
     */
    static transactionFailed(operation, reason, details = {}) {
        return new DatabaseError(
            `Database transaction failed: ${operation}`,
            operation,
            null,
            null,
            { reason, ...details }
        ).withUserMessage('Database transaction failed. Your changes may not have been saved.');
    }

    /**
     * Create error for index creation failure
     */
    static indexCreationFailed(collection, keys, reason, details = {}) {
        return new DatabaseError(
            `Index creation failed on ${collection}`,
            'createIndex',
            collection,
            keys,
            { reason, ...details }
        ).withUserMessage('Failed to create database index. Performance may be affected.');
    }

    /**
     * Create error for migration failure
     */
    static migrationFailed(version, reason, details = {}) {
        return new DatabaseError(
            `Database migration failed: version ${version}`,
            'migrate',
            null,
            null,
            { version, reason, ...details }
        ).withUserMessage('Database migration failed. Please contact support.');
    }

    /**
     * Create error for backup failure
     */
    static backupFailed(reason, details = {}) {
        return new DatabaseError(
            `Database backup failed: ${reason}`,
            'backup',
            null,
            null,
            { reason, ...details }
        ).withUserMessage('Database backup failed. Your data may not be backed up.');
    }

    /**
     * Create error for restore failure
     */
    static restoreFailed(reason, details = {}) {
        return new DatabaseError(
            `Database restore failed: ${reason}`,
            'restore',
            null,
            null,
            { reason, ...details }
        ).withUserMessage('Database restore failed. Please check your backup file.');
    }
}

module.exports = DatabaseError;
