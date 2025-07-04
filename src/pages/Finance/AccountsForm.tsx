import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import { financeService } from '../../services/financeService';
import { ArrowLeft } from 'lucide-react';

// Validation schema
const accountFormSchema = z.object({
  // Basic Information
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['Income', 'Expense', 'Asset', 'Liability', 'Equity']),
  currency: z.string().min(1, 'Currency is required'),
  
  // Balance Information
  initialBalance: z.coerce.number().default(0),
  openingBalance: z.coerce.number().default(0),
  currentBalance: z.coerce.number().default(0),
  
  // Account Status
  isActive: z.boolean().default(true),
  
  // Bank Details
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  branch: z.string().optional(),
  ifscCode: z.string().optional(),
  swiftCode: z.string().optional(),
  
  // Additional Information
  taxId: z.string().optional(),
  notes: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  phone: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountFormSchema>;

interface AccountsFormProps {
  account?: AccountFormData;
  onSuccess?: () => void;
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
];

const ACCOUNT_TYPES = [
  { value: 'Asset', label: 'Asset' },
  { value: 'Liability', label: 'Liability' },
  { value: 'Equity', label: 'Equity' },
  { value: 'Income', label: 'Income' },
  { value: 'Expense', label: 'Expense' },
];

const AccountsForm = ({ account, onSuccess }: AccountsFormProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState('');
  const [, setAccountData] = useState<AccountFormData | null>(null);

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: '',
      type: 'Asset',
      currency: 'USD',
      initialBalance: 0,
      openingBalance: 0,
      currentBalance: 0,
      isActive: true,
      accountNumber: '',
      bankName: '',
      branch: '',
      ifscCode: '',
      swiftCode: '',
      taxId: '',
      notes: '',
      description: '',
      email: '',
      website: '',
      phone: '',
      ...account // Spread existing account data if provided
    }
  });

  const { handleSubmit, formState: { isSubmitting } } = form;
  const { id } = useParams();
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchAccount = async () => {
        try {
          setIsLoading(true);
          const fetchedData = await financeService.getAccount(id);
          // Process data to ensure numeric fields conform to AccountFormData (number, not number | undefined)
          const dataForForm = {
            ...fetchedData,
            initialBalance: fetchedData.initialBalance ?? 0,
            openingBalance: fetchedData.openingBalance ?? 0,
            currentBalance: fetchedData.currentBalance ?? 0,
            isActive: fetchedData.isActive ?? true, // Ensure isActive is boolean
            // Ensure other optional fields that might be null from API are correctly undefined or '' for Zod
            email: fetchedData.email === null ? '' : (fetchedData.email ?? undefined),
            website: fetchedData.website === null ? '' : (fetchedData.website ?? undefined),
            description: fetchedData.description ?? undefined, // Default to undefined if null
            accountNumber: fetchedData.accountNumber ?? undefined,
            bankName: fetchedData.bankName ?? undefined,
            branch: fetchedData.branch ?? undefined,
            ifscCode: fetchedData.ifscCode ?? undefined,
            swiftCode: fetchedData.swiftCode ?? undefined,
            taxId: fetchedData.taxId ?? undefined,
            notes: fetchedData.notes ?? undefined,
            phone: fetchedData.phone ?? undefined // Ensure phone is also handled
          };
          setAccountData(dataForForm as AccountFormData); // Assert type after processing
          form.reset(dataForForm as AccountFormData); // Assert type after processing
        } catch (err) {
          setError('Failed to load account');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAccount();
    }
  }, [id, isEditMode, form]);

  const onSubmit: SubmitHandler<AccountFormData> = async (data) => {
    try {
      setIsLoading(true);
      if (isEditMode && id) {
        await financeService.updateAccount(id, data);
      } else {
        await financeService.createAccount(data);
      }
      onSuccess?.();
      navigate('/finance/accounts');
    } catch (err) {
      setError('Failed to save account');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="text" size="small" onClick={() => navigate('/finance/accounts')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Account' : 'Create Account'}</h1>
      </div>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Basic Information Section */}
                <Card>
                  <CardHeader>
                    <div className="text-lg font-semibold">Basic Information</div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="name">Account Name *</FormLabel>
                            <FormControl>
                              <Input id="name" placeholder="Enter account name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="type">Account Type *</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select account type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ACCOUNT_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="currency">Currency *</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                  {CURRENCIES.map((currency) => (
                                    <SelectItem key={currency.code} value={currency.code}>
                                      {currency.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel htmlFor="isActive">Account Status</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            {form.watch('isActive') ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <FormField
                          name="isActive"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Balance Information */}
                <Card>
                  <CardHeader>
                    <div className="text-lg font-semibold">Balance Information</div>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          name="initialBalance"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="initialBalance">Initial Balance</FormLabel>
                              <FormControl>
                                <Input 
                                  id="initialBalance" 
                                  type="number" 
                                  step="0.01"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          name="openingBalance"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="openingBalance">Opening Balance</FormLabel>
                              <FormControl>
                                <Input 
                                  id="openingBalance" 
                                  type="number" 
                                  step="0.01"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          name="currentBalance"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="currentBalance">Current Balance</FormLabel>
                              <FormControl>
                                <Input 
                                  id="currentBalance" 
                                  type="number" 
                                  step="0.01"
                                  disabled
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bank Details */}
                <Card>
                  <CardHeader>
                    <div className="text-lg font-semibold">Bank Details</div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="bankName">Bank Name</FormLabel>
                            <FormControl>
                              <Input id="bankName" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="branch"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="branch">Branch</FormLabel>
                            <FormControl>
                              <Input id="branch" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="accountNumber">Account Number</FormLabel>
                            <FormControl>
                              <Input id="accountNumber" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="ifscCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="ifscCode">IFSC Code</FormLabel>
                            <FormControl>
                              <Input id="ifscCode" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="swiftCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="swiftCode">SWIFT Code</FormLabel>
                            <FormControl>
                              <Input id="swiftCode" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="taxId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="taxId">Tax ID</FormLabel>
                            <FormControl>
                              <Input id="taxId" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <div className="text-lg font-semibold">Contact Information</div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="email">Email</FormLabel>
                            <FormControl>
                              <Input id="email" type="email" placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="phone">Phone</FormLabel>
                            <FormControl>
                              <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="website"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel htmlFor="website">Website</FormLabel>
                            <FormControl>
                              <Input 
                                id="website" 
                                type="url" 
                                placeholder="https://example.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                  <CardHeader>
                    <div className="text-lg font-semibold">Additional Information</div>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 pt-0">
                      <div className="space-y-4">
                        <FormField
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="description">Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  id="description" 
                                  rows={3} 
                                  placeholder="Enter account description"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage>{''}</FormMessage>
                            </FormItem>
                          )}
                        />

                        <FormField
                          name="notes"
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel htmlFor="notes">Notes</FormLabel>
                              <FormControl>
                                <Textarea 
                                  id="notes" 
                                  rows={4} 
                                  placeholder="Any additional notes"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage>{''}</FormMessage>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/finance/accounts')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Account'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </FormProvider>
    </div>
  );
};
              

export default AccountsForm;