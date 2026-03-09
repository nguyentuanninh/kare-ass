import { DataTableDaoResponse } from '@/types/api.types.js';
import {
    Model,
    ModelStatic,
    FindOptions,
    UpdateOptions,
    DestroyOptions,
    CreateOptions,
    BulkCreateOptions,
    WhereOptions,
    Attributes,
    WhereAttributeHashValue,
    Transaction,
    OrderItem,
} from 'sequelize';

/**
 * A generic DAO (Data Access Object) class that provides common database operations
 * for Sequelize models. This class serves as a base for all model-specific DAOs.
 *
 * @template T - The Sequelize model type that this DAO operates on
 */
export default class SuperDao<T extends Model> {
    private Model: ModelStatic<T>;

    /**
     * Creates a new instance of SuperDao
     * @param {ModelStatic<T>} model - The Sequelize model to operate on
     */
    constructor(model: ModelStatic<T>) {
        this.Model = model;
    }

    /**
     * Retrieves all records from the database
     * @param {FindOptions<Attributes<T>>} [options] - Optional query options
     * @returns {Promise<T[]>} A promise that resolves to an array of model instances
     */
    public async findAll(options?: FindOptions<Attributes<T>>): Promise<T[]> {
        return this.Model.findAll(options)
            .then((result) => result)
            .catch((e) => {
                throw e;
            });
    }

    /**
     * Finds a single record by its primary key
     * @param {number | string} id - The primary key value to search for
     * @param {Omit<FindOptions<Attributes<T>>, 'where'>} [options] - Optional query options
     * @returns {Promise<T | null>} A promise that resolves to the found model instance or null
     */
    public async findById(
        id: number | string,
        options?: Omit<FindOptions<Attributes<T>>, 'where'>
    ): Promise<T | null> {
        const where: WhereOptions<Attributes<T>> = {
            id: id as WhereAttributeHashValue<Attributes<T>['id']>,
        };
        return this.Model.findOne({ where, ...options })
            .then((result) => result)
            .catch((e) => {
                throw e;
            });
    }

    /**
     * Finds a single record matching the specified conditions
     * @param {WhereOptions<Attributes<T>>} where - The conditions to match
     * @param {Omit<FindOptions<Attributes<T>>, 'where'>} [options] - Optional query options
     * @returns {Promise<T | null>} A promise that resolves to the found model instance or null
     */
    public async findOneByWhere(
        where: WhereOptions<Attributes<T>>,
        options?: Omit<FindOptions<Attributes<T>>, 'where'>
    ): Promise<T | null> {
        return this.Model.findOne({
            where,
            ...options,
        })
            .then((result) => result)
            .catch((e) => {
                throw e;
            });
    }

    /**
     * Updates records matching the specified conditions
     * @param {Partial<Attributes<T>>} data - The data to update
     * @param {UpdateOptions<Attributes<T>> & { where: WhereOptions<Attributes<T>> }} options - Update options including where clause
     * @returns {Promise<number>} A promise that resolves to the number of affected rows
     */
    public async updateWhere(
        data: Partial<Attributes<T>>,
        options: UpdateOptions<Attributes<T>> & { where: WhereOptions<Attributes<T>> }
    ): Promise<number> {
        return this.Model.update(data, options)
            .then(([affectedCount]) => affectedCount)
            .catch((e) => {
                throw e;
            });
    }

    /**
     * Updates a record by its primary key
     * @param {Partial<Attributes<T>>} data - The data to update
     * @param {Omit<UpdateOptions<Attributes<T>>, 'where'> & { id: number | string }} options - Update options including id
     * @returns {Promise<number>} A promise that resolves to the number of affected rows
     */
    public async updateById(
        data: Partial<Attributes<T>>,
        options: Omit<UpdateOptions<Attributes<T>>, 'where'> & { id: number | string }
    ): Promise<number> {
        const where: WhereOptions<Attributes<T>> = {
            id: options.id as WhereAttributeHashValue<Attributes<T>['id']>,
        };
        const { id, ...restOptions } = options;
        return this.Model.update(data, { ...restOptions, where })
            .then(([affectedCount]) => affectedCount)
            .catch((e) => {
                throw e;
            });
    }

    /**
     * Creates a new record in the database
     * @param {T['_creationAttributes']} data - The data for the new record
     * @param {CreateOptions} [options] - Optional creation options
     * @returns {Promise<T>} A promise that resolves to the created model instance
     */
    public async create(data: T['_creationAttributes'], options?: CreateOptions): Promise<T> {
        return this.Model.create(data, options)
            .then((result) => result)
            .catch((e) => {
                throw e;
            });
    }

    /**
     * Finds multiple records matching the specified conditions
     * @param {WhereOptions<Attributes<T>>} where - The conditions to match
     * @param {Omit<FindOptions<Attributes<T>>, 'where'>} [options] - Optional query options
     * @returns {Promise<T[]>} A promise that resolves to an array of matching model instances
     */
    public async findByWhere(
        where: WhereOptions<Attributes<T>>,
        options?: Omit<FindOptions<Attributes<T>>, 'where'>
    ): Promise<T[]> {
        return this.Model.findAll({
            where,
            ...options,
        })
            .then((result) => result)
            .catch((e) => {
                throw e;
            });
    }

    /**
     * Deletes records matching the specified conditions
     * @param {WhereOptions<Attributes<T>>} where - The conditions to match
     * @param {Omit<DestroyOptions<Attributes<T>>, 'where'>} [options] - Optional deletion options
     * @returns {Promise<number>} A promise that resolves to the number of deleted rows
     */
    public async deleteByWhere(
        where: WhereOptions<Attributes<T>>,
        options?: Omit<DestroyOptions<Attributes<T>>, 'where'>
    ): Promise<number> {
        return this.Model.destroy({ where, ...options })
            .then((result) => result)
            .catch((e) => {
                throw e;
            });
    }

    /**
     * Creates multiple records in a single operation
     * @param {T['_creationAttributes'][]} data - Array of data for the new records
     * @param {BulkCreateOptions} [options] - Optional bulk creation options
     * @returns {Promise<T[]>} A promise that resolves to an array of created model instances
     */
    public async bulkCreate(
        data: T['_creationAttributes'][],
        options?: BulkCreateOptions
    ): Promise<T[]> {
        return this.Model.bulkCreate(data, options)
            .then((result) => result)
            .catch((e) => {
                throw e;
            });
    }

    /**
     * Updates multiple records matching the specified conditions in a single operation
     * @param {Partial<Attributes<T>>} data - The data to update
     * @param {UpdateOptions<Attributes<T>> & { where: WhereOptions<Attributes<T>> }} options - Update options including where clause
     * @returns {Promise<number>} A promise that resolves to the number of affected rows
     */
    public async bulkUpdate(
        data: Partial<Attributes<T>>,
        options: UpdateOptions<Attributes<T>> & { where: WhereOptions<Attributes<T>> }
    ): Promise<number> {
        return this.Model.update(data, options)
            .then(([affectedCount]) => affectedCount)
            .catch((e) => {
                throw e;
            });
    }

    /**
     * Deletes multiple records matching the specified conditions in a single operation
     * @param {WhereOptions<Attributes<T>>} where - The conditions to match
     * @param {Omit<DestroyOptions<Attributes<T>>, 'where'>} [options] - Optional deletion options
     * @returns {Promise<number>} A promise that resolves to the number of deleted rows
     */
    public async bulkDelete(
        where: WhereOptions<Attributes<T>>,
        options?: Omit<DestroyOptions<Attributes<T>>, 'where'>
    ): Promise<number> {
        return this.Model.destroy({
            where,
            ...options,
        })
            .then((result) => result)
            .catch((e) => {
                throw e;
            });
    }

    /**
     * Counts the number of records matching the specified conditions
     * @param {WhereOptions<Attributes<T>>} where - The conditions to match
     * @param {Omit<FindOptions<Attributes<T>>, 'where'>} [options] - Optional query options
     * @returns {Promise<number>} A promise that resolves to the count of matching records
     */
    public async getCountByWhere(
        where: WhereOptions<Attributes<T>>,
        options?: Omit<FindOptions<Attributes<T>>, 'where'>
    ): Promise<number> {
        return this.Model.count({ where, ...options })
            .then((result) => result)
            .catch((e) => {
                throw e;
            });
    }

    /**
     * Increments a numeric field by a specified value for records matching the conditions
     * @param {keyof Attributes<T>} fieldName - The name of the field to increment
     * @param {FindOptions<Attributes<T>> & { where: WhereOptions<Attributes<T>>, incrementValue?: number }} options - Query options including where clause and increment value
     * @returns {Promise<T | false>} A promise that resolves to the updated model instance or false if not found
     */
    public async incrementCountInFieldByWhere(
        fieldName: keyof Attributes<T>,
        options: FindOptions<Attributes<T>> & {
            where: WhereOptions<Attributes<T>>;
            incrementValue?: number;
        }
    ): Promise<T | false> {
        const { where, incrementValue, ...restOptions } = options;
        const instance = await this.Model.findOne({ where, ...restOptions });
        if (!instance) {
            return false;
        }
        return instance
            .increment(fieldName, { by: incrementValue ?? 1, ...restOptions })
            .then((result) => result)
            .catch((e) => {
                throw e;
            });
    }

    /**
     * Decrements a numeric field by a specified value for records matching the conditions
     * @param {keyof Attributes<T>} fieldName - The name of the field to decrement
     * @param {FindOptions<Attributes<T>> & { where: WhereOptions<Attributes<T>>, decrementValue?: number }} options - Query options including where clause and decrement value
     * @returns {Promise<T | false>} A promise that resolves to the updated model instance or false if not found
     */
    public async decrementCountInFieldByWhere(
        fieldName: keyof Attributes<T>,
        options: FindOptions<Attributes<T>> & {
            where: WhereOptions<Attributes<T>>;
            decrementValue?: number;
        }
    ): Promise<T | false> {
        const { where, decrementValue, ...restOptions } = options;
        const instance = await this.Model.findOne({ where, ...restOptions });
        if (!instance) {
            return false;
        }
        return instance
            .decrement(fieldName, { by: decrementValue ?? 1, ...restOptions })
            .then((result) => result)
            .catch((e) => {
                throw e;
            });
    }

    /**
     * Retrieves paginated data with total count for data table display
     * @param {WhereOptions<Attributes<T>>} where - The conditions to match
     * @param {FindOptions<Attributes<T>>} options - Query options including pagination parameters
     * @returns {Promise<DataTableDaoResponse>} A promise that resolves to an object containing the records and total count
     */
    public async getDataTableData(
        where: WhereOptions<Attributes<T>>,
        options: FindOptions<Attributes<T>>
    ): Promise<DataTableDaoResponse> {
        return this.Model.findAndCountAll({
            where,
            ...options,
        })
            .then((result) => result)
            .catch((e) => {
                throw e;
            });
    }
}
