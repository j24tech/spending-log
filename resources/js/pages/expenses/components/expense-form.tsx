import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFlash } from '@/contexts/FlashContext';
import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Upload, X } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

interface Category {
    id: number;
    name: string;
}

interface PaymentMethod {
    id: number;
    name: string;
}

interface ExpenseDetail {
    id?: number; // Optional, only exists for existing details
    name: string;
    amount: string;
    quantity: string;
    observation: string;
    category_id: string;
    _destroy?: boolean; // Mark for deletion
}

interface ExpenseDiscount {
    id?: number; // Optional, only exists for existing discounts
    discount_id: string;
    observation: string;
    discount_amount: string;
    date: string;
    _destroy?: boolean; // Mark for deletion
}

interface Discount {
    id: number;
    name: string;
    observation: string | null;
}

interface Props {
    categories: Category[];
    paymentMethods: PaymentMethod[];
    discounts: Discount[];
    expense?: {
        id: number;
        name: string;
        expense_date: string;
        observation: string | null;
        document_number: string | null;
        document_path: string | null;
        payment_method_id: number;
        tags: string[] | null;
        expense_details: Array<{
            id: number;
            name: string;
            amount: string;
            quantity: string;
            observation: string | null;
            category_id: number;
        }>;
        expense_discounts?: Array<{
            id: number;
            discount_id: number;
            observation: string | null;
            discount_amount: string;
            date: string;
        }>;
    };
}

export function ExpenseForm({
    categories,
    paymentMethods,
    discounts,
    expense,
}: Props) {
    const isEditing = !!expense;
    const { showFlash } = useFlash();

    // Get current date in YYYY-MM-DD format
    const getCurrentDate = (): string => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Format date for input[type="date"] (YYYY-MM-DD)
    const formatDateForInput = (
        dateString: string | null | undefined,
    ): string => {
        if (!dateString) return '';

        // If it's already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }

        // Otherwise, parse and format
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const { data, setData, post, put, processing, errors } = useForm(
        {
            name: expense?.name || '',
            expense_date:
                formatDateForInput(expense?.expense_date) || getCurrentDate(),
            observation: expense?.observation || '',
            document_number: expense?.document_number || '',
            document: null as File | null,
            payment_method_id: expense?.payment_method_id
                ? expense.payment_method_id.toString()
                : '',
            details:
                expense?.expense_details.map((d) => ({
                    id: d.id,
                    name: d.name,
                    amount: d.amount,
                    quantity: Math.floor(
                        parseFloat(d.quantity) || 1,
                    ).toString(), // Convert to integer without decimals
                    observation: d.observation || '',
                    category_id: d.category_id.toString(),
                    _destroy: false,
                })) ||
                ([
                    {
                        name: '',
                        amount: '',
                        quantity: '1',
                        observation: '',
                        category_id: '',
                        _destroy: false,
                    },
                ] as ExpenseDetail[]),
            expense_discounts:
                expense?.expense_discounts?.map((ed) => ({
                    id: ed.id,
                    discount_id: ed.discount_id.toString(),
                    observation: ed.observation || '',
                    discount_amount: ed.discount_amount,
                    date: formatDateForInput(ed.date) || getCurrentDate(),
                    _destroy: false,
                })) || ([] as ExpenseDiscount[]),
        },
        {
            transform: (data) => {
                // CRITICAL: Use pendingSubmitData if available (when submitting with file)
                // This ensures we have all fields even if React state hasn't updated yet
                const sourceData = pendingSubmitData.current || data;

                // CRITICAL: This transform function MUST include ALL form fields
                // When FormData is used (for file uploads with PUT), Inertia.js requires ALL fields to be explicitly included
                // FormData serialization can lose data if fields are not properly included
                const transformed: any = {};

                // Include ALL required fields - these MUST be sent as strings for FormData compatibility
                transformed.name = String(sourceData.name || '');

                // Ensure expense_date is always a string in YYYY-MM-DD format
                if (
                    !sourceData.expense_date ||
                    String(sourceData.expense_date).trim() === ''
                ) {
                    const today = new Date();
                    transformed.expense_date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                } else {
                    // Convert date format if needed (from DD/MM/YYYY to YYYY-MM-DD)
                    const dateStr = String(sourceData.expense_date);
                    if (dateStr.includes('/')) {
                        // Format: DD/MM/YYYY -> YYYY-MM-DD
                        const [day, month, year] = dateStr.split('/');
                        transformed.expense_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    } else {
                        transformed.expense_date = dateStr;
                    }
                }

                transformed.payment_method_id = String(
                    sourceData.payment_method_id || '',
                );

                // Include ALL optional fields
                transformed.observation =
                    sourceData.observation === ''
                        ? null
                        : sourceData.observation || null;
                transformed.document_number =
                    sourceData.document_number === ''
                        ? null
                        : sourceData.document_number || null;

                // Serialize details array properly for FormData
                // In FormData, arrays must be properly serialized for Laravel to parse them correctly
                if (
                    Array.isArray(sourceData.details) &&
                    sourceData.details.length > 0
                ) {
                    transformed.details = sourceData.details.map(
                        (detail: ExpenseDetail) => {
                            const detailObj: any = {
                                name: String(detail.name || ''),
                                amount: String(detail.amount || '0'),
                                quantity: String(detail.quantity || '1'),
                                category_id: String(detail.category_id || ''),
                                _destroy: detail._destroy || false,
                            };

                            // Only include id if it exists (for updates)
                            if (detail.id) {
                                detailObj.id = String(detail.id);
                            }

                            // Only include observation if it's not empty
                            if (
                                detail.observation &&
                                detail.observation.trim() !== ''
                            ) {
                                detailObj.observation = detail.observation;
                            } else {
                                detailObj.observation = null;
                            }

                            return detailObj;
                        },
                    );
                } else {
                    transformed.details = [];
                }

                // Serialize expense_discounts array properly for FormData
                if (
                    Array.isArray(sourceData.expense_discounts) &&
                    sourceData.expense_discounts.length > 0
                ) {
                    transformed.expense_discounts =
                        sourceData.expense_discounts.map(
                            (discount: ExpenseDiscount) => {
                                const discountObj: any = {
                                    discount_id: String(
                                        discount.discount_id || '',
                                    ),
                                    discount_amount: String(
                                        discount.discount_amount || '0',
                                    ),
                                    _destroy: discount._destroy || false,
                                };

                                // Only include id if it exists (for updates)
                                if (discount.id) {
                                    discountObj.id = String(discount.id);
                                }

                                // Include date - ensure it's in YYYY-MM-DD format
                                if (discount.date) {
                                    const dateStr = String(discount.date);
                                    if (dateStr.includes('/')) {
                                        // Format: DD/MM/YYYY -> YYYY-MM-DD
                                        const [day, month, year] =
                                            dateStr.split('/');
                                        discountObj.date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                                    } else {
                                        discountObj.date = dateStr;
                                    }
                                } else {
                                    // Default to current date if not provided
                                    const today = new Date();
                                    discountObj.date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                                }

                                // Only include observation if it's not empty
                                if (
                                    discount.observation &&
                                    discount.observation.trim() !== ''
                                ) {
                                    discountObj.observation =
                                        discount.observation;
                                } else {
                                    discountObj.observation = null;
                                }

                                return discountObj;
                            },
                        );
                } else {
                    transformed.expense_discounts = [];
                }

                // Include document ONLY if it's a File object
                // This is critical: only include if it's actually a File
                if (sourceData.document instanceof File) {
                    transformed.document = sourceData.document;
                }

                // Clear pending data after transform
                pendingSubmitData.current = null;

                return transformed;
            },
        },
    );

    const [fileName, setFileName] = useState<string>('');
    // Track if user wants to delete existing document
    const [shouldDeleteDocument, setShouldDeleteDocument] = useState(false);
    // Initialize previewUrl with existing document path if editing
    const [previewUrl, setPreviewUrl] = useState<string>(() => {
        if (
            isEditing &&
            expense?.document_path &&
            typeof expense.document_path === 'string' &&
            expense.document_path.trim() !== ''
        ) {
            // Ensure we have a valid path - document_path from DB is like "expense-documents/filename.png"
            const path = expense.document_path;
            // If it's already a full URL, use it as is
            if (path.startsWith('http://') || path.startsWith('https://')) {
                return path;
            }
            // Otherwise, prepend /storage/ to make it accessible
            // Remove any leading slashes from path to avoid double slashes
            const cleanPath = path.startsWith('/') ? path.substring(1) : path;
            const imageUrl = `/storage/${cleanPath}`;
            return imageUrl;
        }
        return '';
    });
    const [isSubmittingWithFile, setIsSubmittingWithFile] = useState(false);
    // Use ref to store complete data for transform when submitting with file
    const pendingSubmitData = useRef<any>(null);

    // Note: Discount validation is handled in the backend via ExpenseRequest

    // CRITICAL: Ensure all fields are present when a document is added during edit
    // This fixes the issue where only the file is changed and other fields are lost
    useEffect(() => {
        if (
            isEditing &&
            expense &&
            data.document instanceof File &&
            !isSubmittingWithFile
        ) {
            // Check if any required fields are missing
            const hasAllRequiredFields =
                data.name &&
                data.expense_date &&
                data.payment_method_id &&
                data.details &&
                data.details.length > 0;

            if (!hasAllRequiredFields) {
                // Fill missing fields from expense - this ensures transform receives all data
                setData({
                    ...data,
                    name: data.name || expense.name,
                    expense_date:
                        data.expense_date ||
                        formatDateForInput(expense.expense_date),
                    payment_method_id:
                        data.payment_method_id ||
                        expense.payment_method_id.toString(),
                    observation: data.observation ?? expense.observation ?? '',
                    document_number:
                        data.document_number ?? expense.document_number ?? '',
                    details:
                        data.details && data.details.length > 0
                            ? data.details
                            : expense.expense_details.map((d) => ({
                                  id: d.id,
                                  name: d.name,
                                  amount: d.amount,
                                  quantity: Math.floor(
                                      parseFloat(d.quantity) || 1,
                                  ).toString(),
                                  observation: d.observation || '',
                                  category_id: d.category_id.toString(),
                                  _destroy: false,
                              })),
                });
            }
        }
    }, [data.document, isEditing, expense, isSubmittingWithFile]);

    // Update preview URL when document changes (new file selected or removed)
    useEffect(() => {
        // If a new file is selected, preview URL is already set in handleFileChange
        // Don't override it here
        if (data.document instanceof File) {
            return;
        }

        // If user marked document for deletion, don't restore preview
        if (shouldDeleteDocument) {
            return;
        }

        // If editing and there's an existing document (and it's not null/empty), restore preview
        if (
            isEditing &&
            expense?.document_path &&
            expense.document_path.trim() !== '' &&
            !data.document
        ) {
            const path = expense.document_path;
            const imageUrl =
                path.startsWith('http://') || path.startsWith('https://')
                    ? path
                    : `/storage/${path.startsWith('/') ? path.substring(1) : path}`;
            // Only update if preview URL is different to avoid unnecessary updates
            if (previewUrl !== imageUrl && !previewUrl.startsWith('blob:')) {
                setPreviewUrl(imageUrl);
            }
        } else if (
            (!expense?.document_path || expense.document_path.trim() === '') &&
            !data.document
        ) {
            // Clear preview URL if there's no document at all (but keep blob URLs)
            if (previewUrl && !previewUrl.startsWith('blob:')) {
                setPreviewUrl('');
            }
        }
    }, [
        data.document,
        expense?.document_path,
        isEditing,
        previewUrl,
        shouldDeleteDocument,
    ]);

    // Clean up preview URL when component unmounts
    useEffect(() => {
        return () => {
            // Only revoke object URLs (created with URL.createObjectURL), not regular URLs
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const addDetail = () => {
        setData('details', [
            ...data.details,
            {
                name: '',
                amount: '',
                quantity: '1',
                observation: '',
                category_id: '',
                _destroy: false,
            },
        ]);
    };

    const removeDetail = (index: number) => {
        const detail = data.details[index];

        // If it's an existing detail (has id), mark for deletion instead of removing
        if (detail.id) {
            const newDetails = [...data.details];
            newDetails[index] = { ...detail, _destroy: true };
            setData('details', newDetails);
        } else {
            // If it's a new detail, remove it from the array
            const newDetails = data.details.filter((_, i) => i !== index);
            setData(
                'details',
                newDetails.length > 0
                    ? newDetails
                    : [
                          {
                              name: '',
                              amount: '',
                              quantity: '1',
                              observation: '',
                              category_id: '',
                              _destroy: false,
                          },
                      ],
            );
        }
    };

    const restoreDetail = (index: number) => {
        const newDetails = [...data.details];
        newDetails[index] = { ...newDetails[index], _destroy: false };
        setData('details', newDetails);
    };

    const updateDetail = (
        index: number,
        field: keyof ExpenseDetail,
        value: string,
    ) => {
        const newDetails = [...data.details];
        // Convert quantity to integer string (remove decimals)
        if (field === 'quantity') {
            const intValue = Math.max(1, Math.floor(parseFloat(value) || 1));
            newDetails[index] = {
                ...newDetails[index],
                [field]: intValue.toString(),
            };
        } else {
            newDetails[index] = { ...newDetails[index], [field]: value };
        }
        setData('details', newDetails);
    };

    const addDiscount = () => {
        // Validar que todos los descuentos existentes tengan un monto mayor a cero
        const activeDiscounts = data.expense_discounts.filter(
            (d) => !d._destroy,
        );

        const hasZeroDiscount = activeDiscounts.some(
            (discount) =>
                !discount.discount_id ||
                parseFloat(discount.discount_amount || '0') === 0,
        );

        if (hasZeroDiscount) {
            showFlash(
                'error',
                'No se puede agregar un nuevo descuento. Complete o elimine el descuento anterior que tiene monto cero.',
            );
            return;
        }

        setData('expense_discounts', [
            ...data.expense_discounts,
            {
                discount_id: '',
                observation: '',
                discount_amount: '0',
                date: getCurrentDate(),
                _destroy: false,
            },
        ]);
    };

    const removeDiscount = (index: number) => {
        const discount = data.expense_discounts[index];

        // If it's an existing discount (has id), mark for deletion instead of removing
        if (discount.id) {
            const newDiscounts = [...data.expense_discounts];
            newDiscounts[index] = { ...discount, _destroy: true };
            setData('expense_discounts', newDiscounts);
        } else {
            // If it's a new discount, remove it from the array
            const newDiscounts = data.expense_discounts.filter(
                (_, i) => i !== index,
            );
            setData('expense_discounts', newDiscounts);
        }
    };

    const restoreDiscount = (index: number) => {
        const newDiscounts = [...data.expense_discounts];
        newDiscounts[index] = {
            ...newDiscounts[index],
            _destroy: false,
        };
        setData('expense_discounts', newDiscounts);
    };

    const updateDiscount = (
        index: number,
        field: keyof ExpenseDiscount,
        value: string,
    ) => {
        const newDiscounts = [...data.expense_discounts];
        newDiscounts[index] = { ...newDiscounts[index], [field]: value };
        setData('expense_discounts', newDiscounts);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check if file is an image (PNG or JPG)
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                alert('Por favor, selecciona solo archivos PNG o JPG');
                e.target.value = ''; // Clear the input
                return;
            }

            // If user selects a new file, clear the delete flag and restore preview of existing if editing
            setShouldDeleteDocument(false);
            setData('document', file);
            setFileName(file.name);

            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleRemoveFile = () => {
        // If there's a new file selected, just remove it and show existing document
        if (data.document instanceof File) {
            setData('document', null);
            setFileName('');
            // Revoke blob URL
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
            // Clear the file input
            const fileInput = document.getElementById(
                'document',
            ) as HTMLInputElement;
            if (fileInput) {
                fileInput.value = '';
            }
            // Restore existing document preview if editing
            if (isEditing && expense?.document_path && !shouldDeleteDocument) {
                const path = expense.document_path;
                const imageUrl =
                    path.startsWith('http://') || path.startsWith('https://')
                        ? path
                        : `/storage/${path.startsWith('/') ? path.substring(1) : path}`;
                setPreviewUrl(imageUrl);
            }
        } else {
            // If showing existing document, mark it for deletion
            if (isEditing && expense?.document_path) {
                setShouldDeleteDocument(true);
            }
            setData('document', null);
            setFileName('');
            // Clear preview URL
            if (previewUrl) {
                if (previewUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(previewUrl);
                }
                setPreviewUrl('');
            }
            // Clear the file input
            const fileInput = document.getElementById(
                'document',
            ) as HTMLInputElement;
            if (fileInput) {
                fileInput.value = '';
            }
        }
    };

    const calculateSubtotal = () => {
        return data.details
            .filter((detail) => !detail._destroy)
            .reduce((sum, detail) => {
                const amount = parseFloat(detail.amount) || 0;
                const quantity = parseFloat(detail.quantity) || 0;
                return sum + amount * quantity;
            }, 0);
    };

    const calculateAppliedDiscounts = () => {
        return data.expense_discounts
            .filter((discount) => !discount._destroy)
            .reduce((sum, discount) => {
                const amount = parseFloat(discount.discount_amount) || 0;
                return sum + amount;
            }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const appliedDiscounts = calculateAppliedDiscounts();
        return Math.max(0, subtotal - appliedDiscounts);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Validar que no haya descuentos con monto cero antes de enviar
        const activeDiscounts = data.expense_discounts.filter(
            (d) => !d._destroy,
        );

        const hasZeroDiscount = activeDiscounts.some((discount) => {
            const amount = parseFloat(discount.discount_amount || '0');
            return amount <= 0;
        });

        if (hasZeroDiscount) {
            showFlash(
                'error',
                'No se puede guardar el gasto. Todos los descuentos deben tener un monto mayor a cero.',
            );
            return;
        }

        // CRITICAL FIX: When updating with a file, use POST with _method: PUT
        // Inertia.js has known issues with PUT + FormData, so we use POST instead
        if (isEditing && expense && data.document instanceof File) {
            // Mark that we're submitting with file
            setIsSubmittingWithFile(true);

            // Build complete data object - use current data or fallback to expense
            // Store in ref so transform can access it immediately
            const completeData = {
                _method: 'PUT', // Laravel method spoofing for PUT request
                name: data.name || expense.name,
                expense_date:
                    data.expense_date ||
                    formatDateForInput(expense.expense_date),
                payment_method_id:
                    data.payment_method_id ||
                    expense.payment_method_id.toString(),
                observation: data.observation ?? expense.observation ?? '',
                document_number:
                    data.document_number ?? expense.document_number ?? '',
                details:
                    data.details && data.details.length > 0
                        ? data.details
                        : expense.expense_details.map((d) => ({
                              id: d.id,
                              name: d.name,
                              amount: d.amount,
                              quantity: Math.floor(
                                  parseFloat(d.quantity) || 1,
                              ).toString(),
                              observation: d.observation || '',
                              category_id: d.category_id.toString(),
                              _destroy: false,
                          })),
                expense_discounts:
                    data.expense_discounts && data.expense_discounts.length > 0
                        ? data.expense_discounts
                        : expense.expense_discounts?.map((ed) => ({
                              id: ed.id,
                              discount_id: ed.discount_id.toString(),
                              observation: ed.observation || '',
                              discount_amount: ed.discount_amount,
                              date:
                                  formatDateForInput(ed.date) ||
                                  getCurrentDate(),
                              _destroy: false,
                          })) || [],
                document: data.document, // Keep the file
            };

            // Store in ref BEFORE calling post - transform will use this
            pendingSubmitData.current = completeData;

            // Update data state for UI consistency
            setData(completeData);

            // CRITICAL: Use router.post directly with FormData
            // Inertia's useForm put() has issues with FormData, so we bypass it
            // Use Laravel's method spoofing: POST with _method: PUT
            const formData = new FormData();

            // Add all fields to FormData explicitly
            formData.append('_method', 'PUT');
            formData.append('name', completeData.name);
            formData.append('expense_date', completeData.expense_date);
            formData.append(
                'payment_method_id',
                completeData.payment_method_id,
            );
            // Always append nullable fields (even if empty)
            formData.append('observation', completeData.observation || '');
            formData.append(
                'document_number',
                completeData.document_number || '',
            );
            formData.append('document', completeData.document);

            // Serialize details array for FormData
            completeData.details.forEach(
                (detail: ExpenseDetail, index: number) => {
                    if (detail.id) {
                        formData.append(
                            `details[${index}][id]`,
                            String(detail.id),
                        );
                    }
                    formData.append(`details[${index}][name]`, detail.name);
                    formData.append(`details[${index}][amount]`, detail.amount);
                    formData.append(
                        `details[${index}][quantity]`,
                        detail.quantity,
                    );
                    formData.append(
                        `details[${index}][category_id]`,
                        detail.category_id,
                    );
                    if (detail.observation) {
                        formData.append(
                            `details[${index}][observation]`,
                            detail.observation,
                        );
                    }
                    formData.append(
                        `details[${index}][_destroy]`,
                        detail._destroy ? '1' : '0',
                    );
                },
            );

            // Serialize expense_discounts array for FormData
            if (completeData.expense_discounts) {
                completeData.expense_discounts.forEach(
                    (discount: ExpenseDiscount, index: number) => {
                        if (discount.id) {
                            formData.append(
                                `expense_discounts[${index}][id]`,
                                String(discount.id),
                            );
                        }
                        formData.append(
                            `expense_discounts[${index}][discount_id]`,
                            discount.discount_id,
                        );
                        formData.append(
                            `expense_discounts[${index}][discount_amount]`,
                            discount.discount_amount,
                        );
                        // Include date - ensure it's in YYYY-MM-DD format
                        const dateValue = discount.date || getCurrentDate();
                        formData.append(
                            `expense_discounts[${index}][date]`,
                            dateValue,
                        );
                        if (discount.observation) {
                            formData.append(
                                `expense_discounts[${index}][observation]`,
                                discount.observation,
                            );
                        }
                        formData.append(
                            `expense_discounts[${index}][_destroy]`,
                            discount._destroy ? '1' : '0',
                        );
                    },
                );
            }

            // Use router.post directly with FormData
            router.post(`/expenses/${expense.id}`, formData, {
                forceFormData: true,
                onFinish: () => {
                    setIsSubmittingWithFile(false);
                    pendingSubmitData.current = null;
                },
                onSuccess: () => {
                    showFlash('success', 'Gasto actualizado exitosamente');
                },
                onError: () => {
                    showFlash('error', 'Error al actualizar el gasto');
                },
            });
            return;
        }

        if (isEditing && expense) {
            // When updating without a file, check if document should be deleted
            if (shouldDeleteDocument && expense.document_path) {
                // Need to send delete_document flag - use POST with FormData
                const formData = new FormData();
                formData.append('_method', 'PUT');
                formData.append('name', data.name);
                // Ensure expense_date is in YYYY-MM-DD format
                const expenseDate =
                    data.expense_date ||
                    formatDateForInput(expense.expense_date);
                formData.append('expense_date', expenseDate);
                formData.append('payment_method_id', data.payment_method_id);
                formData.append('observation', data.observation || '');
                formData.append('document_number', data.document_number || '');
                formData.append('delete_document', '1'); // Signal to delete document

                // Serialize details array
                data.details.forEach((detail: ExpenseDetail, index: number) => {
                    if (detail.id) {
                        formData.append(
                            `details[${index}][id]`,
                            String(detail.id),
                        );
                    }
                    formData.append(`details[${index}][name]`, detail.name);
                    formData.append(`details[${index}][amount]`, detail.amount);
                    formData.append(
                        `details[${index}][quantity]`,
                        detail.quantity,
                    );
                    formData.append(
                        `details[${index}][category_id]`,
                        detail.category_id,
                    );
                    if (detail.observation) {
                        formData.append(
                            `details[${index}][observation]`,
                            detail.observation,
                        );
                    }
                    formData.append(
                        `details[${index}][_destroy]`,
                        detail._destroy ? '1' : '0',
                    );
                });

                // Serialize expense_discounts array for FormData
                data.expense_discounts.forEach(
                    (discount: ExpenseDiscount, index: number) => {
                        if (discount.id) {
                            formData.append(
                                `expense_discounts[${index}][id]`,
                                String(discount.id),
                            );
                        }
                        formData.append(
                            `expense_discounts[${index}][discount_id]`,
                            discount.discount_id,
                        );
                        formData.append(
                            `expense_discounts[${index}][discount_amount]`,
                            discount.discount_amount,
                        );
                        if (discount.observation) {
                            formData.append(
                                `expense_discounts[${index}][observation]`,
                                discount.observation,
                            );
                        }
                        formData.append(
                            `expense_discounts[${index}][_destroy]`,
                            discount._destroy ? '1' : '0',
                        );
                    },
                );

                router.post(`/expenses/${expense.id}`, formData, {
                    forceFormData: true,
                    onSuccess: () => {
                        showFlash('success', 'Gasto actualizado exitosamente');
                    },
                    onError: () => {
                        showFlash('error', 'Error al actualizar el gasto');
                    },
                });
            } else {
                // Normal PUT without file
                put(`/expenses/${expense.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        showFlash('success', 'Gasto actualizado exitosamente');
                    },
                    onError: () => {
                        showFlash('error', 'Error al actualizar el gasto');
                    },
                });
            }
        } else {
            post('/expenses', {
                forceFormData: !!data.document, // Force FormData when document is present
                onSuccess: () => {
                    showFlash('success', 'Gasto creado exitosamente');
                },
                onError: () => {
                    showFlash('error', 'Error al crear el gasto');
                },
            });
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Header con botón volver */}
            <div className="flex items-center gap-4">
                <Button type="button" variant="outline" size="icon" asChild>
                    <Link href="/expenses">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">
                        {isEditing ? 'Editar Gasto' : 'Nuevo Gasto'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditing
                            ? 'Modifica los datos del gasto'
                            : 'Registra un nuevo gasto tipo factura'}
                    </p>
                </div>
            </div>

            {/* Información General */}
            <Card>
                <CardHeader>
                    <CardTitle>Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Gasto *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Ej: Compra de supermercado"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expense_date">Fecha *</Label>
                            <Input
                                id="expense_date"
                                type="date"
                                value={data.expense_date}
                                onChange={(e) =>
                                    setData('expense_date', e.target.value)
                                }
                            />
                            <InputError message={errors.expense_date} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payment_method_id">
                                Método de Pago *
                            </Label>
                            <Select
                                value={data.payment_method_id}
                                onValueChange={(value) =>
                                    setData('payment_method_id', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un método" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethods.map((method) => (
                                        <SelectItem
                                            key={method.id}
                                            value={method.id.toString()}
                                        >
                                            {method.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.payment_method_id} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Etiquetas</Label>
                        <div className="min-h-[2.5rem] rounded-md border bg-muted/50 p-3">
                            {expense?.tags && expense.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                    {expense.tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Las etiquetas se calculan automáticamente
                                    desde las categorías, método de pago y
                                    descuentos
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observation">Observación</Label>
                        <Textarea
                            id="observation"
                            value={data.observation}
                            onChange={(e) =>
                                setData('observation', e.target.value)
                            }
                            placeholder="Descripción general (opcional)"
                            rows={3}
                        />
                        <InputError message={errors.observation} />
                    </div>
                </CardContent>
            </Card>

            {/* Descuentos Aplicados */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Descuentos Aplicados</CardTitle>
                        <Button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addDiscount();
                            }}
                            size="sm"
                            variant="outline"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Descuento
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {data.expense_discounts.map((discount, index) => {
                        // Calcular el número del descuento basado en los descuentos que no están marcados para eliminar
                        const discountNumber = data.expense_discounts
                            .slice(0, index + 1)
                            .filter((d) => !d._destroy).length;

                        return (
                            <Card
                                key={discount.id || index}
                                className={
                                    discount._destroy
                                        ? 'border-destructive/50 bg-destructive/10'
                                        : 'bg-muted/30'
                                }
                            >
                                <CardContent className="pt-4">
                                    {discount._destroy ? (
                                        // Modo eliminado - Mostrar solo resumen con opción de restaurar
                                        <div className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-4">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-destructive"
                                                        >
                                                            Descuento{' '}
                                                            {discountNumber}
                                                        </Badge>
                                                        <p className="font-medium text-destructive line-through">
                                                            {(
                                                                discounts || []
                                                            ).find(
                                                                (d) =>
                                                                    d.id.toString() ===
                                                                    discount.discount_id,
                                                            )?.name ||
                                                                'Descuento'}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Este descuento será
                                                        eliminado al guardar
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    restoreDiscount(index)
                                                }
                                            >
                                                Restaurar
                                            </Button>
                                        </div>
                                    ) : (
                                        // Modo normal - Mostrar campos editables
                                        <div className="space-y-3">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Badge variant="secondary">
                                                    Descuento {discountNumber}
                                                </Badge>
                                            </div>
                                            <div className="grid gap-3 md:grid-cols-12">
                                                <div className="space-y-1 md:col-span-4">
                                                    <Label className="text-xs">
                                                        Tipo de Descuento *
                                                    </Label>
                                                    <Select
                                                        value={
                                                            discount.discount_id
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            updateDiscount(
                                                                index,
                                                                'discount_id',
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccionar descuento" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(
                                                                discounts || []
                                                            ).map((disc) => (
                                                                <SelectItem
                                                                    key={
                                                                        disc.id
                                                                    }
                                                                    value={disc.id.toString()}
                                                                >
                                                                    {disc.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError
                                                        message={
                                                            errors[
                                                                `expense_discounts.${index}.discount_id` as keyof typeof errors
                                                            ]
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-1 md:col-span-3">
                                                    <Label className="text-xs">
                                                        Monto del Descuento *
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={
                                                            discount.discount_amount
                                                        }
                                                        onChange={(e) =>
                                                            updateDiscount(
                                                                index,
                                                                'discount_amount',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="0.00"
                                                        className={
                                                            (() => {
                                                                const subtotal =
                                                                    calculateSubtotal();
                                                                const discountAmount =
                                                                    parseFloat(
                                                                        discount.discount_amount,
                                                                    ) || 0;
                                                                return discountAmount >
                                                                    subtotal
                                                                    ? 'border-destructive'
                                                                    : '';
                                                            })() ||
                                                            errors[
                                                                `expense_discounts.${index}.discount_amount` as keyof typeof errors
                                                            ]
                                                                ? 'border-destructive'
                                                                : ''
                                                        }
                                                    />
                                                    {(() => {
                                                        const subtotal =
                                                            calculateSubtotal();
                                                        const discountAmount =
                                                            parseFloat(
                                                                discount.discount_amount,
                                                            ) || 0;
                                                        const errorMessage =
                                                            errors[
                                                                `expense_discounts.${index}.discount_amount` as keyof typeof errors
                                                            ];

                                                        if (errorMessage) {
                                                            return (
                                                                <InputError
                                                                    message={
                                                                        errorMessage
                                                                    }
                                                                />
                                                            );
                                                        }

                                                        if (
                                                            discountAmount >
                                                                subtotal &&
                                                            discountAmount > 0
                                                        ) {
                                                            return (
                                                                <InputError
                                                                    message={`El monto del descuento (${discountAmount.toFixed(2)}) no puede ser mayor que el subtotal del gasto (${subtotal.toFixed(2)}).`}
                                                                />
                                                            );
                                                        }

                                                        return null;
                                                    })()}
                                                </div>

                                                <div className="space-y-1 md:col-span-2">
                                                    <Label className="text-xs">
                                                        Fecha *
                                                    </Label>
                                                    <Input
                                                        type="date"
                                                        value={
                                                            discount.date ||
                                                            getCurrentDate()
                                                        }
                                                        onChange={(e) =>
                                                            updateDiscount(
                                                                index,
                                                                'date',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <InputError
                                                        message={
                                                            errors[
                                                                `expense_discounts.${index}.date` as keyof typeof errors
                                                            ]
                                                        }
                                                    />
                                                </div>

                                                <div className="flex items-end md:col-span-1">
                                                    {data.expense_discounts.filter(
                                                        (d) => !d._destroy,
                                                    ).length > 0 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                removeDiscount(
                                                                    index,
                                                                )
                                                            }
                                                            className="text-destructive hover:text-destructive"
                                                            title={
                                                                discount.id
                                                                    ? 'Marcar para eliminar'
                                                                    : 'Eliminar descuento'
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Observación opcional para cada descuento */}
                                            <div className="space-y-1">
                                                <Label className="text-xs">
                                                    Observación del descuento
                                                </Label>
                                                <Input
                                                    value={discount.observation}
                                                    onChange={(e) =>
                                                        updateDiscount(
                                                            index,
                                                            'observation',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Descripción adicional (opcional)"
                                                    className="text-sm"
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            `expense_discounts.${index}.observation` as keyof typeof errors
                                                        ]
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}

                    {data.expense_discounts.filter((d) => !d._destroy)
                        .length === 0 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                            No tiene descuentos aplicados
                        </p>
                    )}

                    {data.expense_discounts.filter((d) => !d._destroy).length >
                        0 && (
                        <div className="flex justify-end border-t pt-4">
                            <div className="space-y-1 text-right">
                                <div className="flex items-center justify-between gap-8 text-sm">
                                    <span className="text-muted-foreground">
                                        Total Descuentos (
                                        {
                                            data.expense_discounts.filter(
                                                (d) => !d._destroy,
                                            ).length
                                        }{' '}
                                        descuento
                                        {data.expense_discounts.filter(
                                            (d) => !d._destroy,
                                        ).length !== 1
                                            ? 's'
                                            : ''}
                                        )
                                    </span>
                                    <span className="font-medium text-red-600 dark:text-red-400">
                                        -$
                                        {calculateAppliedDiscounts().toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detalles del Gasto */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Detalles del Gasto</CardTitle>
                        <Button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addDetail();
                            }}
                            size="sm"
                            variant="outline"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Ítem
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {data.details.map((detail, index) => {
                        // Calcular el número del ítem basado en los detalles que no están marcados para eliminar
                        const itemNumber = data.details
                            .slice(0, index + 1)
                            .filter((d) => !d._destroy).length;

                        return (
                            <Card
                                key={detail.id || index}
                                className={
                                    detail._destroy
                                        ? 'border-destructive/50 bg-destructive/10'
                                        : 'bg-muted/30'
                                }
                            >
                                <CardContent className="pt-4">
                                    {detail._destroy ? (
                                        // Modo eliminado - Mostrar solo resumen con opción de restaurar
                                        <div className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-4">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-destructive"
                                                        >
                                                            Ítem {itemNumber}
                                                        </Badge>
                                                        <p className="font-medium text-destructive line-through">
                                                            {detail.name}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Este ítem será eliminado
                                                        al guardar
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    restoreDetail(index)
                                                }
                                            >
                                                Restaurar
                                            </Button>
                                        </div>
                                    ) : (
                                        // Modo normal - Mostrar campos editables
                                        <div className="space-y-3">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Badge variant="secondary">
                                                    Ítem {itemNumber}
                                                </Badge>
                                            </div>
                                            <div className="grid gap-3 md:grid-cols-12">
                                                <div className="space-y-1 md:col-span-4">
                                                    <Label className="text-xs">
                                                        Descripción *
                                                    </Label>
                                                    <Input
                                                        value={detail.name}
                                                        onChange={(e) =>
                                                            updateDetail(
                                                                index,
                                                                'name',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Nombre del ítem"
                                                    />
                                                    <InputError
                                                        message={
                                                            errors[
                                                                `details.${index}.name` as keyof typeof errors
                                                            ]
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-1 md:col-span-2">
                                                    <Label className="text-xs">
                                                        Categoría *
                                                    </Label>
                                                    <Select
                                                        value={
                                                            detail.category_id
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            updateDetail(
                                                                index,
                                                                'category_id',
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Categoría" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map(
                                                                (category) => (
                                                                    <SelectItem
                                                                        key={
                                                                            category.id
                                                                        }
                                                                        value={category.id.toString()}
                                                                    >
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError
                                                        message={
                                                            errors[
                                                                `details.${index}.category_id` as keyof typeof errors
                                                            ]
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-1 md:col-span-2">
                                                    <Label className="text-xs">
                                                        Cantidad *
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        min="1"
                                                        value={Math.floor(
                                                            parseFloat(
                                                                detail.quantity,
                                                            ) || 1,
                                                        ).toString()}
                                                        onChange={(e) => {
                                                            // Only allow integers (no decimals)
                                                            const value =
                                                                e.target.value;
                                                            if (
                                                                value === '' ||
                                                                /^\d+$/.test(
                                                                    value,
                                                                )
                                                            ) {
                                                                updateDetail(
                                                                    index,
                                                                    'quantity',
                                                                    value,
                                                                );
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            // Ensure minimum value of 1 when field loses focus and remove decimals
                                                            const value =
                                                                e.target.value;
                                                            if (
                                                                value === '' ||
                                                                parseFloat(
                                                                    value,
                                                                ) < 1
                                                            ) {
                                                                updateDetail(
                                                                    index,
                                                                    'quantity',
                                                                    '1',
                                                                );
                                                            } else {
                                                                // Remove decimals if user entered them
                                                                const intValue =
                                                                    Math.floor(
                                                                        parseFloat(
                                                                            value,
                                                                        ),
                                                                    );
                                                                updateDetail(
                                                                    index,
                                                                    'quantity',
                                                                    intValue.toString(),
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <InputError
                                                        message={
                                                            errors[
                                                                `details.${index}.quantity` as keyof typeof errors
                                                            ]
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-1 md:col-span-2">
                                                    <Label className="text-xs">
                                                        Precio Unit. *
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={detail.amount}
                                                        onChange={(e) =>
                                                            updateDetail(
                                                                index,
                                                                'amount',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <InputError
                                                        message={
                                                            errors[
                                                                `details.${index}.amount` as keyof typeof errors
                                                            ]
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-1 md:col-span-1">
                                                    <Label className="text-xs">
                                                        Subtotal
                                                    </Label>
                                                    <Input
                                                        value={(
                                                            (parseFloat(
                                                                detail.amount,
                                                            ) || 0) *
                                                            (parseFloat(
                                                                detail.quantity,
                                                            ) || 0)
                                                        ).toFixed(2)}
                                                        readOnly
                                                        className="bg-muted font-medium"
                                                    />
                                                </div>

                                                <div className="flex items-end md:col-span-1">
                                                    {(data.details.filter(
                                                        (d) => !d._destroy,
                                                    ).length > 1 ||
                                                        !detail.id) && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                removeDetail(
                                                                    index,
                                                                )
                                                            }
                                                            className="text-destructive hover:text-destructive"
                                                            title={
                                                                detail.id
                                                                    ? 'Marcar para eliminar'
                                                                    : 'Eliminar ítem'
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Observación opcional para cada ítem */}
                                            <div className="space-y-1">
                                                <Label className="text-xs">
                                                    Observación del ítem
                                                </Label>
                                                <Input
                                                    value={detail.observation}
                                                    onChange={(e) =>
                                                        updateDetail(
                                                            index,
                                                            'observation',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Descripción adicional (opcional)"
                                                    className="text-sm"
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            `details.${index}.observation` as keyof typeof errors
                                                        ]
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}

                    <div className="flex justify-end border-t pt-4">
                        <div className="space-y-1 text-right">
                            <div className="flex items-center justify-between gap-8 text-sm">
                                <span className="text-muted-foreground">
                                    Subtotal (
                                    {
                                        data.details.filter((d) => !d._destroy)
                                            .length
                                    }{' '}
                                    ítems)
                                </span>
                                <span className="font-medium">
                                    ${calculateSubtotal().toFixed(2)}
                                </span>
                            </div>
                            {data.expense_discounts.filter((d) => !d._destroy)
                                .length > 0 && (
                                <div className="flex items-center justify-between gap-8 text-sm">
                                    <span className="text-muted-foreground">
                                        Descuentos Aplicados (
                                        {
                                            data.expense_discounts.filter(
                                                (d) => !d._destroy,
                                            ).length
                                        }
                                        )
                                    </span>
                                    <span className="font-medium text-red-600">
                                        -$
                                        {calculateAppliedDiscounts().toFixed(2)}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between gap-8 border-t pt-2">
                                <span className="text-sm text-muted-foreground">
                                    Total
                                </span>
                                <span className="text-2xl font-bold">
                                    ${calculateTotal().toFixed(2)}
                                </span>
                            </div>
                            {(data.details.some((d) => d._destroy) ||
                                data.expense_discounts.some(
                                    (d) => d._destroy,
                                )) && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {
                                        data.details.filter((d) => d._destroy)
                                            .length
                                    }{' '}
                                    ítem(s) y{' '}
                                    {
                                        data.expense_discounts.filter(
                                            (d) => d._destroy,
                                        ).length
                                    }{' '}
                                    descuento(s) marcado(s) para eliminar
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Documentación */}
            <Card>
                <CardHeader>
                    <CardTitle>Documentación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="document_number">
                                Número de Documento
                            </Label>
                            <Input
                                id="document_number"
                                value={data.document_number}
                                onChange={(e) =>
                                    setData('document_number', e.target.value)
                                }
                                placeholder="Ej: FAC-001"
                            />
                            <InputError message={errors.document_number} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="document">
                                Captura de pantalla (Solo PNG o JPG)
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="document"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() =>
                                        document
                                            .getElementById('document')
                                            ?.click()
                                    }
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {fileName ||
                                        (expense?.document_path &&
                                        typeof expense.document_path ===
                                            'string' &&
                                        expense.document_path.trim() !== ''
                                            ? 'Cambiar archivo'
                                            : 'Seleccionar imagen')}
                                </Button>
                            </div>
                            {previewUrl && previewUrl.trim() !== '' && (
                                <div className="relative mt-4 overflow-hidden rounded-lg border bg-muted">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="h-auto max-h-96 w-full object-contain"
                                        onError={(e) => {
                                            console.error(
                                                'Error loading image:',
                                                previewUrl,
                                            );
                                            console.error(
                                                'Image error event:',
                                                e,
                                            );
                                            // Hide preview on error
                                            setPreviewUrl('');
                                        }}
                                        onLoad={() => {
                                            // Image loaded successfully
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2"
                                        onClick={handleRemoveFile}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <InputError message={errors.document} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" asChild>
                    <Link href="/expenses">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing
                        ? 'Guardando...'
                        : isEditing
                          ? 'Actualizar Gasto'
                          : 'Guardar Gasto'}
                </Button>
            </div>
        </form>
    );
}
