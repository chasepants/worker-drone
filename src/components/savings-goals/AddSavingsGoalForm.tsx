import { updateUserItems } from '../../redux/thunks/user'
import { MouseEventHandler, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import addSavingsGoalFormActions from '../../redux/actions/addSavingsGoalFormActions'
import ClipLoader from 'react-spinners/ClipLoader'
import { Button, Form  } from 'react-bootstrap'
import { RootState } from '../../redux/reducers'
import { FormErrorProps, FormInputProps } from '../login/types'
import { AutomaticTransfersTitleProps, FormButtonProps, RequiredSavingsGoalInputs, RequiredTransferInputs, SavingsGoalAccountOptionProps, SavingsPlanAccountDropDownProps, SavingsPlansInputProps } from './types'

/** STOLEN FROM LOGINPAGE.JS */
function FormInput(props: FormInputProps): JSX.Element {
//   const showFormText = !!props['FormText']
  const {label, name, type, errors, handleInput} = props

  return (
    <Form.Group className='col-sm-6'>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        name={name}
        type={type}
        onChange={(e) => handleInput(e)}
        isInvalid={!!errors[name]}
      />
      {/* {showFormText ? <FormText/> : ''}  */}
      <Form.Control.Feedback type="invalid">
        {errors[name]}
      </Form.Control.Feedback>
    </Form.Group>
  )
}

/** STOLEN FROM LOGINPAGE.JS */
function FormButton({handleFormSubmit, isSaving, itemForm, items}: FormButtonProps): JSX.Element {
    const dispatch = useDispatch()
    return (
        <Form.Group className='col-sm-6 offset-sm-3 text-center mb-5'>
            <div className="input-group d-flex justify-content-evenly">
                <Button onClick={handleFormSubmit} className="btn-sharp btn-success">
                    { isSaving && '' === itemForm.add_error ? <ClipLoader color="#ffffff" loading={isSaving} size={20} /> : "Save" } 
                </Button>
                {
                    items.length > 0 && (
                        <Button onClick={() => dispatch(addSavingsGoalFormActions.hideAddSavingsGoalForm())} className="btn-sharp btn-warning">
                            Close
                        </Button>
                    )
                }
            </div>
        </Form.Group>
    )
}

/** STOLEN FROM LOGINPAGE.JS */
function FormError({error}: FormErrorProps): JSX.Element {
    return (
      <div className="row mt-2">
        <div className="col-sm-6 offset-sm-3 text-center">
          <Form.Text className='text-danger'>{error}</Form.Text>
        </div>
      </div>
    )
}

function AccountOption({ account }: SavingsGoalAccountOptionProps ): JSX.Element {
    return (
        <option key={account.account_id} value={account.account_id}>
            {account.name}
        </option>
    )
}

function SavingsPlanAccountDropDown({handleInput, name, label, plaid_items, detail, errors}: SavingsPlanAccountDropDownProps): JSX.Element {
    return (
        <Form.Group className='col-sm-3'>
            <Form.Control onChange={handleInput} as='select' name={name} isInvalid={!!errors[name]}>
                <option value=''>{label}</option>
                {plaid_items.map(plaidItem => plaidItem.accounts.map(account => <AccountOption account={account} />))}
            </Form.Control>
            <span className='text-muted'>{detail}</span>
            <Form.Control.Feedback type="invalid">
                {errors[name]}
            </Form.Control.Feedback>
        </Form.Group>
    )
} 

function AutomaticTransfersSectionTitle({ length }: AutomaticTransfersTitleProps): JSX.Element {
    return (
        <div className='col-sm-12'>
            <h5>Saving's Plan - Set Up Automatic Transfers</h5>
            {length === 0 && <span className='text-muted'>Only available after linking more than one bank account</span>}
        </div>
    )
}

function AddSavingsPlanInputs({plaid_items, handleInput, errors}: SavingsPlansInputProps): JSX.Element {
    const options = [
        { value: '', label: 'Every' },
        { value: 'daily', label: 'Day' },
        { value: 'weekly', label: 'Week' },
        { value: 'bi-weekly', label: 'Other Week' },
        { value: 'monthly', label: 'Month' },
        { value: 'quarterly', label: '3 Months' },
        { value: 'semi-annually', label: '6 Months' },
        { value: 'annually', label: 'Year' }
    ]

    return plaid_items.length > 0 ? (
        <>
            <div className='col-sm-1'>
                <span>TRANSFER:</span>    
            </div>
            <div className='col-sm-3'>
                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text">$</span>
                    </div>
                    <Form.Control
                        className='form-control'
                        name="savings_amount"
                        type="text"
                        onChange={(e) => handleInput(e)}
                        isInvalid={!!(errors as RequiredTransferInputs).savings_amount}
                    />
                    <Form.Control.Feedback type="invalid">
                        {(errors as RequiredTransferInputs).savings_amount}
                    </Form.Control.Feedback>
                </div>
            </div>
            <SavingsPlanAccountDropDown handleInput={handleInput} name={'from_account_id'} label='From' plaid_items={plaid_items} detail='From which account?' errors={errors}/>
            <SavingsPlanAccountDropDown handleInput={handleInput} name={'to_account_id'} label='To' plaid_items={plaid_items} detail='To which account?' errors={errors}/>
            <Form.Group className='col-sm-2'>
                <Form.Control as='select' isInvalid={!!(errors as RequiredTransferInputs).savings_rate} name="savings_rate" onChange={(e) => handleInput(e)}>
                    { options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Form.Control>
                <span className='text-muted'>How often?</span>
                <Form.Control.Feedback type="invalid">
                    {(errors as RequiredTransferInputs).savings_rate}
                </Form.Control.Feedback>
            </Form.Group>
        </>
    ) : <div></div>
}

function AddSavingsGoalForm(): JSX.Element {
    const [inputs, setInputs] = useState<RequiredTransferInputs|RequiredSavingsGoalInputs|{}>({})
    const [errors, setErrors] = useState<any>({})
    const [isSaving, setIsSaving] = useState(false)
    const items = useSelector((state: RootState) => state.user.savings_items)
    const itemForm = useSelector((state: RootState) => state.addSavingsGoalForm)
    const plaid_items = useSelector((state: RootState) => state.user.plaid_items)

    const requiredInputs = [
        'goal', 
        'description',
        'amount', 
        'link'
    ]

    const requiredTransferInputs = [
        ...requiredInputs,
        'transfer_from_id',
        'transfer_to_id',
        'savings_amount',
        'savings_rate'
    ]

    const dispatch = useDispatch()

    /**COPIED LOGIN PAGE Helper function for getErrors */
    const isEmpty = (str: string) => !str || str === ''

    /**COPIED LOGIN PAGE Validate inputs and return a list of new errors since last form submit */
    const getErrors = () => {
        const newErrors = {}
        const expectedInputs = plaid_items.length > 0 ? requiredTransferInputs : requiredInputs
        
        for (const key of expectedInputs) {
            if (isEmpty(inputs[key])) {
              newErrors[key] = `Please enter a ${key}`
            }
        }

        return newErrors
    }

    const getUpdateObj = () => {
        return {
            name: (inputs as RequiredSavingsGoalInputs).goal,
            decription: (inputs as RequiredSavingsGoalInputs).description,
            amount: Number.parseFloat((inputs as RequiredSavingsGoalInputs).amount),
            url: (inputs as RequiredSavingsGoalInputs).link,
            saving_plan: {
                fromAccount: (inputs as RequiredTransferInputs).transfer_from_id,
                toAccount: (inputs as RequiredTransferInputs).transfer_to_id,
                amount: Number.parseFloat((inputs as RequiredTransferInputs).savings_amount),
                cadence: (inputs as RequiredTransferInputs).savings_rate
            }
        }
    }

    const handleInput = (e: any) => {
        setInputs({
            ...inputs,
            [e.target.name]: e.target.value,
        })
    
        //check for previous error, reset error for new input
        if (!!errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: null,
            })
        }
    }

    const handleFormSubmit = (e: any) => {
        e.preventDefault()

        const newErrors = getErrors()

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors)
          setIsSaving(false)
          return
        }
        
        dispatch(updateUserItems(getUpdateObj()))
        setIsSaving(true) 
    }

    return (
        <div className="row mb-5">
            <div className="col-sm-10 offset-sm-1 border mb-5">
                <div className='row mt-5 text-center'>
                    <h3>Add A Saving's Goal</h3>
                </div>
                <Form className='row g-3 mt-3'>
                    <FormInput label='Add A Name' name='goal' type='text' handleInput={handleInput} errors={errors}/>
                    <FormInput label='Add A Description' name='description' type='text' handleInput={handleInput} errors={errors}/>
                    <FormInput label='Add A Link' name='link' type='text' handleInput={handleInput} errors={errors}/>
                    <FormInput label='Add A Goal Amount' name='amount' type='text' handleInput={handleInput} errors={errors}/>
                    <AutomaticTransfersSectionTitle length={plaid_items.length}/>
                    <AddSavingsPlanInputs plaid_items={plaid_items} handleInput={handleInput} errors={errors} />
                    <FormButton handleFormSubmit={handleFormSubmit} isSaving={isSaving} itemForm={itemForm} items={items}/>
                    {'' !== itemForm.add_error && <FormError error={itemForm.add_error}/>}
                </Form>
            </div>
        </div>
    )
}

export default AddSavingsGoalForm;