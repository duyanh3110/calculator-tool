<script>
import { COMMISSION_RATE, TAX_RATE, TIMMA_RATE } from '@/constants';
import axios from 'axios';
import runtimeConfig from '@/utils/getRuntimeConfig';

export default {
    name: 'HomeView',
    mounted() {
        this.setDateField();
        this.fetchData();
    },
    data() {
        return {
            dateField: '',
            serviceName: '',
            servicePrice: '',
            isTimmaCustomer: false,
            serviceList: [],
            total: 0,
            income: 0,
            tax: 0,
            grossWage: 0,
            wage: 0
        };
    },
    watch: {
        serviceList: {
            handler(newValue) {
                console.log('WATCHER ::: ', newValue);
            },
            deep: true
        }
    },
    methods: {
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
            console.log('CONFIG ::: ', runtimeConfig('VUE_APP_API_PATH'));
            axios
                .get(`${runtimeConfig('VUE_APP_API_PATH')}`)
                .then((response) => {
                    if (response.data.length > 0) {
                        console.log('response.data :: ', response.data);
                        this.serviceList = response.data;
                        this.calculateIncome();
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        },
        handlePostRequest(newService) {
            const $ = this;
            axios
                .post(`${runtimeConfig('VUE_APP_API_PATH')}`, newService)
                .then(function () {
                    $.fetchData();
                })
                .catch(function (error) {
                    console.error(error);
                });
        },
        addService() {
            if (this.serviceName == '' || this.servicePrice == '') {
                alert('Please enter both service name and price.');
                return;
            }

            const newService = {
                name: this.serviceName,
                price: parseInt(this.servicePrice),
                isTimmaCustomer: this.isTimmaCustomer
            };

            this.handlePostRequest(newService);
            this.calculateIncome();
            this.clearInput();
        },
        clearInput() {
            this.serviceName = '';
            this.servicePrice = '';
        },
        calculateIncome() {
            this.total = 0;
            this.income = 0;
            for (let service of this.serviceList) {
                this.total += service.price;
                if (service.isTimmaCustomer) {
                    this.income += service.price * (1 - TIMMA_RATE);
                } else {
                    this.income += service.price;
                }
            }

            this.calculateWage(this.income);
        },
        calculateWage(income) {
            if (typeof income !== 'number') {
                income = parseInt(income);
            }

            const personalIncome = income * COMMISSION_RATE;

            this.wage = (personalIncome * (1 - TAX_RATE)).toFixed(2);
            this.tax = (personalIncome * TAX_RATE).toFixed(2);
            this.grossWage = Number(this.wage) + Number(this.tax);
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
            <button
                @click="addService"
                class="border border-white rounded-md bg-indigo-500 text-white mt-2 mb-5 py-3 text-xl text-bold uppercase"
            >
                Add Service
            </button>
        </div>

        <div class="list max-w-xs mx-auto" v-if="serviceList.length > 0">
            <h2 class="font-bold text-center">Service List</h2>
            <ol class="list-inside list-decimal">
                <li v-for="service in serviceList" :key="service.name">
                    {{ service.isTimmaCustomer ? 'Timma - ' : '' }}
                    {{ service.name }}: {{ service.price }}$
                </li>
            </ol>
        </div>

        <div
            class="result max-w-xs mx-auto mt-5 text-center"
            v-if="serviceList.length > 0"
        >
            <h2 class="font-bold">Overall</h2>
            <div class="total">
                <span class="font-bold">Total: </span>
                <span>{{ total }}$</span>
            </div>
            <div class="income">
                <span class="font-bold">Income: </span>
                <span>{{ income }}$</span>
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
