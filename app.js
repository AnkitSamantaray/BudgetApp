// BUDGET CONTROLLER

var budgetController = (function(){

    var Expense = function(id, category, description, value) {
        this.id = id;
        this.category = category;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function (totalIncome) {
        var percentage;
        if(totalIncome>0) {
        this.percentage = Math.round((this.value/totalIncome)*100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function(id, category, description, value) {
        this.id = id;
        this.category = category;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var findObjbyCategory = function (arr, prop) {
        for (var i=0; i<arr.length; i++) {
            if(arr[i].title === prop) {
                return arr[i];
            } 
        }
    };


    var data = {
        allItems: {
            expense: [],
            income: []
        },
        totals: {
            expense: 0,
            income: 0,
            catexpense: [{title:'Education|education', total:0},
                        {title:'Shopping|shopping', total:0},
                        {title:'Food & Dining|food', total:0},
                        {title:'Health & Fitness|health', total:0},
                        {title:'Entertainment|entertainment', total:0}],
            catincome: [{title:'Salary|salary', total:0},
                        {title:'Investment|investment', total:0},
                        {title:'Returned purchase|returned_purchase', total:0}, 
                        {title:'Bonus|bonus', total:0}]
        },
        budget: 0,
        percentage: -1
    }

    var calcCatTotal = function(type, cat){
        var catTotal = 0;
        for (i=0; i<data.allItems[type].length; i++) {
            if (data.allItems[type][i].category === cat) { 
                catTotal += data.allItems[type][i].value;
            }

        };
        obj = findObjbyCategory(data.totals['cat' + type], cat);
        if (obj) {
            obj.total = catTotal;
        } else {
            data.totals['cat' + type].push({
            category: cat,
            total: catTotal
        }); 
    };
};
    return {
        
        addItem: function (type, cat, desc, val) {
            var newItem, ID, catTotal;

            //ID = lastID + 1;
            //Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            } else {
                ID = 0;
            };
            

            //Create new item based on expense or income type
            if(type === 'expense') {
                newItem = new Expense(ID, cat, desc, val);
            } else if (type === 'income') {
                newItem = new Income(ID, cat, desc, val);
            }

            //Push it into our data structure
            data.allItems[type].push(newItem);

            //Update total amount for this category
            calcCatTotal(type, cat);

            //Return new element
            return newItem;
        },

        deleteItem: function(type, ID) {
            var ids, index;
            ids = data.allItems[type].map(function(cur){
                return cur.id;
            });
            index = ids.indexOf(ID);
            console.log(index);
            if (index !== -1) {
            cat = data.allItems[type][index].category;
            data.allItems[type].splice(index, 1);

             //Update total amount for this category
            calcCatTotal(type, cat);
            };
        },

        testing: function() {
            console.log(data);
        },



        calculateBudget: function () {
            var totalexp, totalinc, budget, percentage;
            //1. Calculate total expenses/income
            calculateTotal('expense');
            calculateTotal('income');

            //2. Calculate the budget
            data.budget = data.totals.income - data.totals.expense;

            //3. Calculate percentage of income that we spent
            if(data.totals.income>0) {
            data.percentage = Math.round(data.totals.expense/data.totals.income * 100);
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentages: function() {
            data.allItems.expense.forEach(function(cur){
                cur.calcPercentage(data.totals.income);
            });
        },

        getPercentages: function() {
            var perc;
            perc = data.allItems.expense.map(function(cur){
                return cur.getPercentage();
            });
            return perc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.income,
                totalExp: data.totals.expense,
                percentage: data.percentage
            }
        },
        getTotals: function() {
            return data.totals;
        },

        getCatTotals: function(type, cat) {
            for (i = 0; i<data.totals['cat' + type].length; i++) {
                if (data.totals['cat' + type][i].title === cat){
                    return data.totals['cat' + type][i].total;
                }
            }
        },
    };

})();



//UI CONTROLLER

var UIController = (function(){
    
    var DOMstrings = {
        inputType: '.add__type',
        inputCategory: '.add__category',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePerc: '.item__percentage',
        dateLabel: '.budget__title--month'
    }


/*     var categories = {
        expense: ['Education|education', 'Shopping|shopping', 'Food & Dining|food', 'Health & Fitness|health', 'Entertainment|entertainment'],
        income: ['Salary|salary', 'Investment|investment', 'Returned purchase|returned_purchase', 'Bonus|bonus']
    } */

/*     var getSelectedText = function(className) {
        element =  document.querySelector(className);
        if (element.selectedIndex === -1) {return null;} 
        return element.options[element.selectedIndex].text; 
    } */

    var formatNumber = function (num, type) {

        // + or - before a number
        // exactly 2 decimal points
        //comma separate for the thousands

        num = Math.abs(num);
        num = num.toFixed(2);
        num = num.replace(/\B(?=(\d{3})+(?!\d))/g,',');
        return (type === 'income'? '+': '-') + ' ' + num;
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either "income" or "expense"
                category: document.querySelector(DOMstrings.inputCategory).options[document.querySelector(DOMstrings.inputCategory).selectedIndex].text + '|' + document.querySelector(DOMstrings.inputCategory).value,
                description: document.querySelector(DOMstrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        getDOMstrings: function() {
            return DOMstrings;
        },

        displayMonth:  function() {
            var now, year, month, months;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
             
        },


        addListItem: function (obj, type, total) {
            var html, newHtml, element, cat, catHtml, categoryName, categoryClass;
            categoryName = obj.category.split('|')[0];
            categoryClass = obj.category.split('|')[1];
            cat = document.getElementsByClassName(categoryClass);
            //Create HTML string with placeholder text
            if (type === 'income') {  
                element = DOMstrings.incomeContainer;
                if (cat.length === 0) {
                    catHtml = '<div class="item__category %category_class%"><h2 class="teal">%category%</h2></div><div id = "total%category_class%" class = "total"></div>';
                    catHtml = catHtml.replace(/%category_class%/g, categoryClass);
                    catHtml = catHtml.replace(/%category%/, categoryName);
                    document.querySelector(element).insertAdjacentHTML('beforeend', catHtml);
                    }
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn remove"><i class="ion-ios-close-outline remove"></i></button></div></div></div>';
            } else {
                element = DOMstrings.expensesContainer;
                if (cat.length === 0) {
                    catHtml = '<div class="item__category %category_class%"><h2 class="red">%category%</h2></div><div id = "total%category_class%" class = "total"></div>';
                    catHtml = catHtml.replace(/%category_class%/g, categoryClass);
                    catHtml = catHtml.replace(/%category%/, categoryName);
                    document.querySelector(element).insertAdjacentHTML('beforeend', catHtml);
                    }
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%perc%</div><div class="item__delete"><button class="item__delete--btn remove"><i class="ion-ios-close-outline remove"></i></button></div></div></div>';                                                
            };
            //Replace holder text with an actual data
            newHtml = html.replace('%id%', obj.id);
            //newHtml = newHtml.replace(/%category%/g, obj.category);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            document.querySelector('.' + categoryClass).insertAdjacentHTML('beforeend', newHtml);
            document.getElementById('total' + categoryClass).textContent = formatNumber(total, type);

            //Insert the HTML into the DOM

            //document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        removeListItem: function(id, type, total){
            var element = document.getElementById(id);
            var parent = element.parentNode;
            var sibling = parent.nextSibling;
            element.parentNode.removeChild(element);
            if (parent.childNodes.length === 1) {
                parent.parentNode.removeChild(parent);
                sibling.parentNode.removeChild(sibling);
            } else {
                sibling.textContent = formatNumber(total, type);
            }

        },

        clearFields: function() {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputCategory + ', ' + DOMstrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(current) {
                current.value = "";
            }); 
            fieldsArray[0].focus();
        },
        displayCategories: function(categories) {
            var cat = document.querySelector(DOMstrings.inputCategory);
            cat.options.length = 1;
            for(i=0; i<categories.length; i++) {
                cat.options[cat.options.length] = new Option(categories[i].title.split('|')[0], categories[i].title.split('|')[1]);
            }
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'income' : type = 'expense';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'income');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'expense');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            };
        },

        displayPercentages: function(arr) {
            var percNodes;
            percNodes = document.querySelectorAll(DOMstrings.expensePerc);
            percNodes.forEach(function (cur, index){
                if (arr[index] > 0) {
                cur.textContent = arr[index] + '%';
                } else {
                    cur.textContent = '---';
                }
            });
        },
        
        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputCategory + ', ' +
                DOMstrings.inputDesc + ',' +
                DOMstrings.inputValue);

            fields.forEach(function (cur) {
                cur.classList.toggle('red-focus')
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        }
    };

})();



//GLOBAL APP CONTROLLER


var controller = (function(budgetCtrl, UICtrl){

    var DOM = UICtrl.getDOMstrings();
    var totals = budgetCtrl.getTotals();
    var setupEventListeners = function(){

/*         document.querySelector(DOM.inputCategory).selectedIndex = -1; */
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.querySelector(DOM.inputValue).addEventListener('keypress', function(event){
            if(event.key === 'Enter' || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', function () {
            UICtrl.changedType();
            updateCategories();
        });
    };

    var updateCategories = function() {
        var sel = document.querySelector(DOM.inputType).selectedIndex;
        sel === 0? sel = 'catincome': sel = 'catexpense'; 
        UICtrl.displayCategories(totals[sel]);
    }
   
    var ctrlAddItem = function() {
        var input, newItem, catTotal;

        //1. Get the field input data

        input = UICtrl.getInput();

        if (input.category && !isNaN(input.value) && input.value > 0) {

        //2. Add the item to the budget controller

        newItem = budgetCtrl.addItem(input.type, input.category, input.description, input.value);
        
        catTotal = budgetCtrl.getCatTotals(input.type, input.category);

        //3. Add the item to the UI controller
        UICtrl.addListItem(newItem, input.type, catTotal);

        //4. Clear the fields
        UICtrl.clearFields();
        
        //5. Calculate and update budget

        updateBudget();

        //6. Calculate and update percentages
        updatePercentages();


        }
    };

    var ctrlDeleteItem = function(event) {
        var itemDelete, splitID, type, ID;

        function findParent (element, className) {
            while ((element = element.parentElement) && !element.classList.contains(className));
            return element;

        };

        itemDelete = findParent(event.target, 'item');
        //income-1
        if (itemDelete && event.target.classList.contains('remove')) {
            splitID = itemDelete.id.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            //2. Delete the item from UI

            var cat = itemDelete.parentNode.classList[1];
            var totalObj = totals['cat' + type].find(function(element) {
               return element.title.includes(cat);
            });
            UICtrl.removeListItem(itemDelete.id, type, totalObj.total)

            //3. Update and show the new budget
            updateBudget();

            //4. Calculate and update percentages
            updatePercentages();


    };
};

    var updateBudget = function() {

        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function () {
        var allPerc;
        //1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        //2. Return the percentages
        allPerc = budgetCtrl.getPercentages();
        //3. Display the percentages
        UICtrl.displayPercentages(allPerc);
    };


    return {
        init: function(){
            console.log('App has started.');
            var totals = budgetCtrl.getTotals();
            console.log(totals);
            UICtrl.displayCategories(totals.catincome);
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();