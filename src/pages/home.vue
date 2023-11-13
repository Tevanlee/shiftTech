<script setup>
import { ref, onMounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router'

const cardNumber = ref('')
const cvv = ref('')
const country = ref('')
const invalidCard = ref(false)
const disableBtn = ref(true)
const count = ref(0)
const showError = ref(false)
const bannedCountry = ref('')
const bannedCountries = ref([])
const validCards = ref([])
const cardExistsError = ref(false)
const showSessionData = ref(false)
const menuOpen = ref(false)
const router = useRouter()

// Validate and add card to array and store card with details in storage
const addCard = () => {
    if (invalidCard.value) {
        console.log("Invalid card")
        count.value = 0
        country.value = ''
        showError.value = true
    } else {
        console.log("Valid card")
        showError.value = false
        localStorage.setItem('cardNo', cardNumber.value)
        localStorage.setItem('cardCVV', cvv.value)
        localStorage.setItem('cardCountry', country.value)

        if (!validCards.value.includes(cardNumber.value)) {
            validCards.value.push(cardNumber.value)
            cardExistsError.value = false
        } else {
            cardExistsError.value = true
        }

        localStorage.setItem('validCards', validCards.value)

        // Reset Inputs
        cardNumber.value = ''
        cvv.value = ''
        country.value = ''
    }

}

// Check banned country array for card country match and count
const checkCardOrigin = () => {
    for (let index = 0; index < bannedCountries.value.length; index++) {
        if (bannedCountries.value[index] == country.value) {
            count.value++
        }
    }
}

// Add banned country to array if it doesn't exist
const addBannedCountry = () => {
    if (!bannedCountries.value.includes(bannedCountry.value)) {
        bannedCountries.value.push(bannedCountry.value)
    }

    localStorage.setItem('bannedCountries', bannedCountries.value)
}

// Toggle top menu to view session data
const toggleSessionData = () => {
    showSessionData.value = !showSessionData.value
    menuOpen.value = !menuOpen.value
}

// Clear session data
const clearSession = () => {
    localStorage.clear()
    router.go()
}

// Remove specific country from array of banned countries and update in storage
const removeCountry = (country) => {
    const index = bannedCountries.value.indexOf(country)
    if (index > -1) { 
        bannedCountries.value.splice(index, 1)
    }

    localStorage.setItem('bannedCountries', bannedCountries.value)
}

onMounted(() => {
    watchEffect(() => {
        // Check if user has entered data
        if (cardNumber.value.length == 16 && cvv.value.length == 3 && country.value.length > 0) {
            disableBtn.value = false
        } else {
            disableBtn.value = true
        }

        // Flag if card belongs to banned country
        if (count.value > 0) {
            invalidCard.value = true
        } else {
            invalidCard.value = false
        }

        // Check if localStorage exists and set valid cards for this session
        if (localStorage.getItem('validCards')) {
            validCards.value = localStorage.getItem('validCards').split(',')
        }

        // Check if localStorage exists and set banned countries for this session
        if (localStorage.getItem('bannedCountries')) {
            bannedCountries.value = localStorage.getItem('bannedCountries').split(',')
        }
    })

})

</script>
<template>
    <section class="card-details">
        <div class="flexbox align-center space-center flex-wrap">
            <div class="input-group">
                <h4>Credit Card Details</h4>
                <input class="input" type="text" placeholder="Enter your card number" v-model="cardNumber"
                    onkeypress='return event.charCode >= 48 && event.charCode <= 57' maxlength="16" />
                <input class="input" type="text" placeholder="Enter your cvv number" v-model="cvv"
                    onkeypress='return event.charCode >= 48 && event.charCode <= 57' maxlength="3" />
                <select v-model="country" class="countries" :on-change="checkCardOrigin()">
                    <option value="" selected>Select a country</option>
                    <option value="ZA">South Africa</option>
                    <option value="Russia">Russia</option>
                    <option value="Columbia">Columbia</option>
                </select>
                <span class="invalid-card-msg" v-if="showError">Invalid entry!</span>
                <span class="invalid-card-msg" v-if="cardExistsError">Card already validated</span>
                <button class="primary-btn" :class="{ 'invalid-card': disableBtn }" @click="addCard()">Add Card</button>
            </div>
        </div>
        <div class="session-data">
            <h4>
                Session Data
                <div class="toggle" @click="toggleSessionData()">
                    <div class="line one" v-if="!menuOpen"></div>
                    <div class="line two"></div>
                </div>
            </h4>
            <div class="inner-wrapper" v-if="showSessionData">
                <h5>Valid cards this session:</h5>
                <div class="card" v-for="card in validCards" :key="card.id" v-if="validCards.length > 0">
                    <span>Card No : {{ card }}</span>
                </div>
                <div class="no-cards" v-else>
                    <span>No cards added during this session</span>
                </div>
            </div>
            <div class="inner-wrapper" v-if="showSessionData">
                <h5>Banned countries:</h5>
                <div class="card" v-for="item in bannedCountries" :key="item.id" v-if="bannedCountries.length > 0">
                    <span>{{ item }}</span>
                    <span class="remove" @click="removeCountry(item)"></span>
                </div>
                <div class="no-banned-countries" v-else>
                    <span>No banned countries active this session</span>
                </div>
                <div class="manage-banned-countries">
                    <h5>Add a Banned country</h5>
                    <select v-model="bannedCountry" class="countries">
                        <option value="" selected>Select a country</option>
                        <option value="ZA">South Africa</option>
                        <option value="Russia">Russia</option>
                        <option value="Columbia">Columbia</option>
                    </select>
                    <button class="primary-btn" @click="addBannedCountry()">Add</button>
                </div>
                <button class="primary-btn" @click="clearSession()">Clear session</button>
            </div>
        </div>
    </section>
</template>
<style lang="scss" scoped>
section.card-details {
    height: 100vh;
    box-sizing: border-box;
    padding: 20px;

    .flexbox {
        height: 100%;
    }
}

.input-group {
    margin: auto;
    flex-wrap: wrap;
    position: relative;
    max-width: 400px;

    @media (min-width: 840px) {
        display: flex;
    }

    span.invalid-card-msg {
        color: rgb(255, 88, 88);
        position: absolute;
        top: 45px;
        font-size: 12px;
        width: 100%;
        text-align: center;
    }

    h4 {
        text-align: center;
        margin-bottom: 30px;
        width: 100%;
    }
}

.session-data {
    position: absolute;
    top: 20px;
    left: 20px;
    padding: 20px;
    border-radius: 10px;
    border: 1px solid #eee;
    box-sizing: border-box;
    transition: .4s;
    width: 100%;
    max-width: 300px;

    h4 {
        font-size: 1.4rem;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
        position: relative;

        div.toggle {
            position: absolute;
            top: 2px;
            right: 0;
            width: 20px;
            height: 20px;
            cursor: pointer;

            .line {
                position: absolute;

                &.one {
                    height: 100%;
                    width: 1px;
                    background-color: #000;
                    top: 0;
                    left: 50%;
                }

                &.two {
                    height: 1px;
                    width: 100%;
                    background-color: #000;
                    top: 50%;
                    left: 0;
                }
            }
        }
    }

    .inner-wrapper {

        margin-bottom: 20px;

        h5 {
            font-size: 1rem;
            margin-top: 0;
        }

        .card {
            box-sizing: border-box;
            padding: 4px 8px;
            border-radius: 4px;
            background-color: #eee;
            margin: 10px 0;
            transition: .4s;
            position: relative;

            span {
                font-size: .8rem;

                &.remove {
                    position: absolute;
                    right: 10px;
                    top: 12px;
                    height: 2px;
                    width: 15px;
                    cursor: pointer;
                    background-color: red;
                    border-radius: 2px;
                }
            }
        }

        span {
            font-size: .8rem;
        }
    }

    .manage-banned-countries {
        margin-top: 30px;
    }
}
</style>