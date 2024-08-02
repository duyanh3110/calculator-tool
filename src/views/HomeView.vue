<script>
import { COMMISSION_RATE, TAX_RATE, TIMMA_RATE } from '@/constants';
import axios from 'axios';

export default {
    name: 'HomeView',
    mounted() {
        this.isLoading = true;
        this.setDateField();
        this.fetchData();
    },
    computed: {
        apiUrl() {
            return `${import.meta.env.DEV ? import.meta.env.VITE_VUE_APP_API_DEV : import.meta.env.VITE_VUE_APP_API}`;
        }
    },
    data() {
        return {
            dateField: '',
            serviceName: '',
            servicePrice: '',
            extraName: '',
            extraPrice: '',
            isTimmaCustomer: false,
            serviceList: [],
            total: 0,
            tax: 0,
            grossWage: 0,
            wage: 0,
            isLoading: false
        };
    },
    methods: {
        getNetPrice(isTimmaCustomer, price) {
            return isTimmaCustomer
                ? parseFloat(price) * (1 - TIMMA_RATE)
                : parseFloat(price);
        },
        setDateField() {
            const today = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };

            this.dateField = today.toLocaleDateString('en-US', options);
        },
        fetchData() {
            axios
                .get(`${this.apiUrl}/services`)
                .then((response) => {
                    this.serviceList = response.data;
                    this.calculateIncome();
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        handlePostRequest(newService) {
            this.isLoading = true;
            const $ = this;
            axios
                .post(`${this.apiUrl}/services`, newService)
                .then(function () {
                    $.fetchData();
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        addService() {
            if (this.serviceName === '' || this.servicePrice === '') {
                alert('Please enter both service name and price.');
                return;
            }

            const newService = {
                serviceName: this.serviceName,
                servicePrice: this.servicePrice,
                extraName: this.extraName,
                extraPrice: parseFloat(
                    this.extraPrice === '' ? 0 : this.extraPrice
                ),
                isTimmaCustomer: this.isTimmaCustomer
            };

            this.handlePostRequest(newService);
            this.calculateIncome();
            this.clearInput();
        },
        clearInput() {
            this.serviceName = '';
            this.servicePrice = '';
            this.extraPrice = '';
            this.isTimmaCustomer = false;
        },
        deleteService(id) {
            this.isLoading = true;
            const $ = this;
            axios
                .delete(`${this.apiUrl}/services/${id}`)
                .then(() => {
                    $.fetchData();
                })
                .catch((error) => {
                    console.error(error);
                });
        },
        calculateIncome() {
            this.total = 0;
            for (let service of this.serviceList) {
                this.total =
                    this.total +
                    this.getNetPrice(
                        service.isTimmaCustomer,
                        service.servicePrice
                    ) +
                    Number(service.extraPrice);
            }

            this.calculateWage(this.total);
        },
        calculateWage(income) {
            const personalIncome = income * COMMISSION_RATE;

            this.grossWage = personalIncome.toFixed(2);
            this.tax = (personalIncome - personalIncome / TAX_RATE).toFixed(2);
            this.wage = (this.grossWage - this.tax).toFixed(2);
        }
    }
};
</script>

<template>
    <main class="m-5">
        <h1 class="text-3xl font-bold mb-2 text-center">Simple Calculator</h1>
        <div class="flex flex-col flex-wrap max-w-xs mx-auto">
            <h3 class="mb-2 text-center">
                <span class="font-bold">Today: </span>
                <span>{{ dateField }}</span>
            </h3>

            <label for="serviceName" class="font-bold">Name</label>
            <input
                type="text"
                v-model="serviceName"
                class="border border-black rounded p-2"
            />
            <label for="servicePrice" class="font-bold mt-2">Price</label>
            <input
                type="text"
                v-model="servicePrice"
                class="border border-black rounded p-2"
            />
            <div class="flex flex-row items-center mt-2">
                <input
                    type="checkbox"
                    v-model="isTimmaCustomer"
                    class="mr-1 border border-black rounded w-4 h-4"
                />
                <label for="checkbox" class="font-bold">Timma</label>
            </div>
            <label for="serviceName" class="font-bold" v-if="isTimmaCustomer"
                >Extra Service</label
            >
            <input
                type="text"
                v-if="isTimmaCustomer"
                v-model="extraName"
                class="border border-black rounded p-2"
            />
            <label for="servicePrice" class="font-bold" v-if="isTimmaCustomer"
                >Extra price</label
            >
            <input
                v-if="isTimmaCustomer"
                type="text"
                v-model="extraPrice"
                class="border border-black rounded p-2"
            />
            <button
                @click="addService"
                class="border border-white rounded-md bg-indigo-500 text-white my-5 py-3 text-xl text-bold uppercase flex justify-center"
            >
                <svg
                    v-if="isLoading"
                    class="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                >
                    <path
                        fill="currentColor"
                        d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
                        opacity="0.25"
                    />
                    <path
                        fill="currentColor"
                        d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z"
                    >
                        <animateTransform
                            attributeName="transform"
                            dur="0.75s"
                            repeatCount="indefinite"
                            type="rotate"
                            values="0 12 12;360 12 12"
                        />
                    </path>
                </svg>
                <span v-else>Add Service</span>
            </button>
        </div>

        <div class="list max-w-xs mx-auto">
            <h2 class="font-bold text-center">Service List</h2>
            <svg
                v-if="isLoading"
                class="animate-spin h-20 w-20 mx-auto mt-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
            >
                <path
                    fill="currentColor"
                    d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
                    opacity="0.25"
                />
                <path
                    fill="currentColor"
                    d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z"
                >
                    <animateTransform
                        attributeName="transform"
                        dur="0.75s"
                        repeatCount="indefinite"
                        type="rotate"
                        values="0 12 12;360 12 12"
                    />
                </path>
            </svg>
            <ol v-else>
                <li
                    v-for="(service, index) in serviceList"
                    :key="service._id"
                    class="flex justify-between items-center border-black border-t-2 last:border-b-2 p-1"
                >
                    <p>
                        {{ index + 1 }}.
                        {{ service.isTimmaCustomer ? 'Timma - ' : ''
                        }}{{ service.serviceName }}: {{ service.servicePrice }}$
                        - {{ service.extraName }}: {{ service.extraPrice }}$ -
                        Total:
                        {{
                            Number(
                                getNetPrice(
                                    service.isTimmaCustomer,
                                    service.servicePrice
                                )
                            ) + Number(service.extraPrice)
                        }}$({{
                            getNetPrice(
                                service.isTimmaCustomer,
                                service.servicePrice
                            )
                        }}$ + {{ service.extraPrice }}$)
                    </p>
                    <button
                        class="border bg-orange-800 rounded text-bold text-white uppercase p-2"
                        @click="deleteService(service._id)"
                    >
                        Delete
                    </button>
                </li>
            </ol>
        </div>

        <div class="result max-w-xs mx-auto mt-5 text-center" v-if="!isLoading">
            <h2 class="font-bold">Overall</h2>
            <div class="total">
                <span class="font-bold">Total: </span>
                <span>{{ total }}$</span>
            </div>
            <div class="tax">
                <span class="font-bold">Wage before tax: </span>
                <span>{{ grossWage }}$</span>
            </div>
            <div class="wage">
                <span class="font-bold">Tax: </span>
                <span>{{ tax }}$</span>
            </div>
            <div class="wage">
                <span class="font-bold">Wage after tax: </span>
                <span>{{ wage }}$</span>
            </div>
        </div>
    </main>
</template>
