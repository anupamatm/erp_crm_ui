import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { financeService } from '../../services/financeService';
import { TransactionFormValues, transactionSchema } from '../../schemas/finance';
import { format } from 'date-fns';
import { Upload, CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { useToast } from '../../components/ui/use-toast';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '../../components/ui/form';

const TransactionForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Array<{ _id: string; name: string; type: string }>>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; type: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date(),
      type: 'Income',
      amount: 0,
      accountId: '',
      toAccountId: undefined,
      categoryId: undefined,
      description: '',
      reference: '',
      attachments: [],
    },
    mode: 'onChange'
  });

  const transactionType = form.watch('type') as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch accounts
        const accountsData = await financeService.getAccounts();
        setAccounts(accountsData);
        
        // Fetch categories based on transaction type
        const categoriesData = await financeService.getTransactionCategories(transactionType as any);
        setCategories(categoriesData);
        
        // If in edit mode, fetch transaction data
        if (isEditMode && id) {
          const transaction = await financeService.getTransaction(id);
          form.reset({
            ...transaction,
            date: new Date(transaction.date),
          });
          
          // Handle existing attachments if any
          if (transaction.attachments?.length) {
            form.setValue('attachments', transaction.attachments);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load transaction data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, transactionType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('attachments', [...form.getValues().attachments, file], { shouldValidate: true });
    }
  };

  const removeFile = (index: number) => {
    const files = [...form.getValues().attachments];
    files.splice(index, 1);
    form.setValue('attachments', files, { shouldValidate: true });
  };

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      setLoading(true);
      
      const transactionData = {
        ...data,
        date: data.date.toISOString(),
        amount: Number(data.amount),
      };

      if (data.attachments?.length) {
        const formData = new FormData();
        Object.keys(transactionData).forEach((key) => {
          const value = transactionData[key as keyof TransactionFormValues];
          if (key !== 'attachments' && value !== undefined) {
            formData.append(key, value.toString());
          }
        });

        data.attachments.forEach((file) => {
          formData.append('attachments', file);
        });

        await financeService.createTransaction(formData);
      } else {
        await financeService.createTransaction(transactionData);
      }

      toast({
        title: 'Success',
        description: 'Transaction created successfully',
      });
      navigate(-1);
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to create transaction',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transaction Type */}
          <FormField
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="type">Transaction Type</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Income">Income</SelectItem>
                      <SelectItem value="Expense">Expense</SelectItem>
                      <SelectItem value="Transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage>
                  {form.formState.errors.type?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          {/* Date */}
          <FormField
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="date">Date</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        date={field.value}
                        onChange={field.onChange}
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage>
                  {form.formState.errors.date?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          {/* Amount */}
          <FormField
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="amount">Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.amount?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          {/* Account */}
          <FormField
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="accountId">Account</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account._id} value={account._id}>
                          {account.name} ({account.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage>
                  {form.formState.errors.accountId?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          {/* To Account (for transfers) */}
          {form.watch('type') === 'Transfer' && (
            <FormField
              name="toAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="toAccountId">To Account</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts
                          .filter((acc) => acc._id !== form.watch('accountId'))
                          .map((account) => (
                            <SelectItem key={account._id} value={account._id}>
                              {account.name} ({account.type})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.toAccountId?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
          )}
          {/* Category (not shown for transfers) */}
          {form.watch('type') !== 'Transfer' && (
            <FormField
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="categoryId">Category</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.categoryId?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
          )}
          {/* Description */}
          <FormField
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="description">Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter a brief description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.description?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          {/* Reference */}
          <FormField
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="reference">Reference</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Invoice #12345"
                    {...field}
                  />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.reference?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          {/* Attachments */}
          <FormField
            name="attachments"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="attachments">Attachments</FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-2">
                    {field.value.map((file, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span>{file.name}</span>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => removeFile(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outlined"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      onChange={handleFileChange}
                    />
                  </div>
                </FormControl>
                <FormMessage>
                  {form.formState.errors.attachments?.message}
                </FormMessage>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="text" size="small" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
