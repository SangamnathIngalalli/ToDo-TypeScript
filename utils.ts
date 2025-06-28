// Generic API Response Types
interface ApiResponse<T> {
    data: T;
    status: number;
    success: boolean;
    message?: string;
    timestamp: Date;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

// Generic API Response Handler
class ApiHandler {
    static createSuccessResponse<T>(data: T, message: string = 'Success'): ApiResponse<T> {
        return {
            data,
            status: 200,
            success: true,
            message,
            timestamp: new Date()
        };
    }

    static createPaginatedResponse<T>(
        items: T[], 
        page: number, 
        pageSize: number, 
        total: number,
        message: string = 'Success'
    ): PaginatedResponse<T> {
        return {
            data: items,
            status: 200,
            success: true,
            message,
            timestamp: new Date(),
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        };
    }

    static createErrorResponse(status: number, message: string): ApiResponse<null> {
        return {
            data: null,
            status,
            success: false,
            message,
            timestamp: new Date()
        };
    }
}

// Generic Repository Pattern
class Repository<T extends { id: number }> {
    private items: T[] = [];
    private nextId = 1;

    constructor(initialItems: T[] = []) {
        // Ensure all items have valid IDs and no duplicates
        const seenIds = new Set<number>();
        this.items = initialItems.map(item => {
            if (item.id <= 0) {
                throw new Error(`Invalid ID: ${item.id}. ID must be a positive number`);
            }
            if (seenIds.has(item.id)) {
                throw new Error(`Duplicate ID found: ${item.id}`);
            }
            seenIds.add(item.id);
            return { ...item };
        });
        
        this.nextId = initialItems.length > 0 
            ? Math.max(0, ...initialItems.map(item => item.id)) + 1 
            : 1;
    }

    /**
     * Get all items in the repository
     */
    getAll(): T[] {
        return this.items.map(item => ({ ...item }));
    }

    /**
     * Get an item by its ID
     */
    getById(id: number): T | undefined {
        const item = this.items.find(item => item.id === id);
        return item ? { ...item } : undefined;
    }

    /**
     * Create a new item in the repository
     * @param item The item to create (without an ID)
     * @returns The created item with a new ID
     */
    create(item: Omit<T, 'id'>): T {
        const newItem = { ...item, id: this.nextId++ } as T;
        this.items = [...this.items, newItem];
        return { ...newItem };
    }

    /**
     * Update an existing item
     * @param id The ID of the item to update
     * @param updates The fields to update
     * @returns The updated item, or undefined if not found
     */
    update(id: number, updates: Partial<Omit<T, 'id'>>): T | undefined {
        const index = this.items.findIndex(item => item.id === id);
        if (index === -1) return undefined;
        
        // Create a new array to ensure immutability
        const updatedItems = [...this.items];
        updatedItems[index] = { 
            ...updatedItems[index], 
            ...updates 
        };
        
        this.items = updatedItems;
        return { ...updatedItems[index] };
    }

    /**
     * Delete an item by ID
     * @param id The ID of the item to delete
     * @returns true if the item was deleted, false if not found
     */
    delete(id: number): boolean {
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.id !== id);
        return this.items.length < initialLength;
    }
    
    /**
     * Check if an item with the given ID exists
     */
    exists(id: number): boolean {
        return this.items.some(item => item.id === id);
    }
    
    /**
     * Get the number of items in the repository
     */
    count(): number {
        return this.items.length;
    }
    
    /**
     * Find items that match a predicate
     * @param predicate A function that returns true for items to include
     */
    query(predicate: (item: T) => boolean): T[] {
        return this.items.filter(predicate).map(item => ({ ...item }));
    }
}

// Generic Result Type for Operations
class Result<T> {
    public isSuccess: boolean;
    public isFailure: boolean;
    public error?: string;
    private _value?: T;

    private constructor(isSuccess: boolean, error?: string, value?: T) {
        if (isSuccess && error) {
            throw new Error("InvalidOperation: A result cannot be successful and contain an error");
        }
        if (!isSuccess && !error) {
            throw new Error("InvalidOperation: A failing result needs to contain an error message");
        }

        this.isSuccess = isSuccess;
        this.isFailure = !isSuccess;
        this.error = error;
        this._value = value;
    }

    public getValue(): T {
        if (!this.isSuccess) {
            throw new Error("Can't get the value of a failed result.");
        }
        return this._value!;
    }

    public static ok<U>(value?: U): Result<U> {
        return new Result<U>(true, undefined, value);
    }

    public static fail<U>(error: string): Result<U> {
        return new Result<U>(false, error);
    }

    public static combine(results: Result<any>[]): Result<any> {
        for (const result of results) {
            if (result.isFailure) return result;
        }
        return Result.ok();
    }
}

// Generic Mapper for DTOs
class Mapper<TSource, TTarget> {
    constructor(private mappingFn: (source: TSource) => TTarget) {}

    map(source: TSource): TTarget {
        return this.mappingFn(source);
    }

    mapArray(sources: TSource[]): TTarget[] {
        return sources.map(this.mappingFn);
    }

    static create<TSource, TTarget>(mappingFn: (source: TSource) => TTarget): Mapper<TSource, TTarget> {
        return new Mapper(mappingFn);
    }
}

export { 
    ApiHandler, 
    Repository, 
    Result, 
    Mapper, 
    type ApiResponse, 
    type PaginatedResponse 
};
