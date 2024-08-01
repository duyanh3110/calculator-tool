<script>
import { COMMISSION_RATE, TAX_RATE, TIMMA_RATE } from '@/constants';
import axios from 'axios';

export default {
    name: 'HomeView',
    mounted() {
        this.checkData();
        this.setDateField();
        this.fetchData();
    },
    data() {
        return {
            dateField: '',
            serviceName: '',
            servicePrice: '',
            extraPrice: '',
            isTimmaCustomer: false,
            serviceList: [],
            total: 0,
            tax: 0,
            grossWage: 0,
            wage: 0
        };
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
        async checkData() {
            await axios.get(`${import.meta.env.VITE_VUE_APP_API_DEV}/files`);
        },
        fetchData() {
            axios
                .get(`${import.meta.env.VITE_VUE_APP_API_DEV}/services`)
                .then((response) => {
                    this.serviceList = response.data;
                    this.calculateIncome();
                })
                .catch((error) => {
                    console.error(error);
                });
        },
        handlePostRequest(newService) {
            const $ = this;
            axios
                .post(
                    `${import.meta.env.VITE_VUE_APP_API_DEV}/services`,
                    newService
                )
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
                name: this.serviceName,
                price: this.isTimmaCustomer
                    ? parseFloat(this.servicePrice) * (1 - TIMMA_RATE)
                    : parseFloat(this.servicePrice) +
                      parseFloat(this.extraPrice),
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
        },
        deleteService(id) {
            const $ = this;
            axios
                .delete(
                    `${import.meta.env.VITE_VUE_APP_API_DEV}/services/${id}`
                )
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
                this.total = (this.total + service.price).toFixed(2);
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
                class="border border-white rounded-md bg-indigo-500 text-white my-5 py-3 text-xl text-bold uppercase"
            >
                Add Service
            </button>
        </div>

        <div class="list max-w-xs mx-auto" v-if="serviceList.length > 0">
            <h2 class="font-bold text-center">Service List</h2>
            <ol>
                <li
                    v-for="(service, index) in serviceList"
                    :key="service.id"
                    class="flex justify-between items-center border-black border-t-2 last:border-b-2 p-1"
                >
                    <p>
                        {{ index + 1 }}.
                        {{ service.isTimmaCustomer ? 'Timma - ' : ''
                        }}{{ service.name }}: {{ service.price }}$ +
                        {{ service.extraPrice }}$
                    </p>
                    <button
                        class="border bg-orange-800 rounded text-bold text-white uppercase p-2"
                        @click="deleteService(service.id)"
                    >
                        Delete
                    </button>
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
