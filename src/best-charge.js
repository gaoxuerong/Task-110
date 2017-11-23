const loadAllItems = require('./items');
const loadPromotions = require('./promotions');
//分割字符串"ITEM0001" : "1"
function cartItems(inputs) {
  let map=new Map();
  inputs.forEach(value=>{
    map.set(value.split('x')[0],value.split('x')[1]);
  });
  return Array.from(map).map(value=>{
    return {barcode:value[0].trim(),count:value[1].trim()}
  });
}
//购物清单
function getReceiptItems(loadAllItems,cartItems){
  let cartItem = cartItems;
  let allItem = loadAllItems;
  let receiptItem = [],
      receiptItems = [];
  for(let i of allItem){
    for(let j of cartItem){
      if(j.barcode == i.id){
        if(!receiptItem[i.id]){
          receiptItem[i.id]={};
          receiptItem[i.id].barcode = i.id;
          receiptItem[i.id].name = i.name;
          receiptItem[i.id].count = j.count;
          receiptItem[i.id].price = i.price;
          receiptItem[i.id].subTotal= i.price*j.count;
        }
      }
    }
  }
  for(let key in receiptItem){
    receiptItems.push(receiptItem[key]);
  }
  return receiptItems;
}
//30-6的优惠方式
function thirtySubSix(getReceiptItem){
  let result =[],
    saved=0,
  summary =0;
  let ReceiptItems = getReceiptItem;
  for(let item of ReceiptItems){
    summary +=item.count*item.price;
  }
  if(summary>30){
    result.push({'saved':6,'summary':summary-6});
  }else{
    result.push({'saved':saved,'summary':summary});
  }
  return result;
}
//半价的优惠方式
function payHalfMoney(getReceiptItems,loadPromotions){
  let result=[]
    subitems=[],
      saved=0
    summary =0;
  let ReceiptItems = getReceiptItems;
  let loadPromotion = loadPromotions;
  for(let i of loadPromotion[1].items) {
    for (let item of ReceiptItems) {
        if (item.barcode === i) {
          subitems.push(item.name);
          saved += item.count * item.price * 0.5;
        }
    }
  }
  for (let item of ReceiptItems){
    summary += item.count * item.price;
  }
  summary-=saved;
  result.push({'saved':saved,'summary':summary,'subitems':subitems})
  return result;
}
//没有优惠
function noDiscount(getReceiptItems){
  let result=[]
  summary =0;
  let ReceiptItems = getReceiptItems;
  for (let item of ReceiptItems){
    summary += item.count * item.price;
  }
  result.push({'summary':summary})
  return result;
}
//打印清单
function printReceipts(ReceiptItem,loadPromotions,payhalfmoneys,nodiscounts,thirtySubsixs){
  let result ='============= 订餐明细 =============\n';
  let ReceiptItems = ReceiptItem,
      loadPromotion = loadPromotions,
      payhalfmoney = payhalfmoneys,
      nodiscount=nodiscounts,
      thirtySubsix= thirtySubsixs;
    for(let items of ReceiptItems){
      result+= items.name+' x '+items.count+' = '+items.subTotal+'元\n';
    }
    if((payhalfmoney[0].saved!==0)||(thirtySubsix[0].saved!=0)){
      if(thirtySubsix[0].summary>payhalfmoney[0].summary){
      console.log(thirtySubsix[0].summary)
        result+='-----------------------------------\n'+'使用优惠:\n'+
          loadPromotion[1].type+'('+payhalfmoney[0].subitems+')'+'，省'+payhalfmoney[0].saved+'元\n'+
          '-----------------------------------\n'+
          '总计：'+payhalfmoney[0].summary+'元\n';
      }else{
        result+='-----------------------------------\n'+'使用优惠:\n'+
          loadPromotion[0].type+'，省'+thirtySubsix[0].saved+'元\n'+
          '-----------------------------------\n'+
          '总计：'+thirtySubsix[0].summary+'元\n';
      }
    }else if(nodiscount[0].summary>30){
      result+='-----------------------------------\n'+'使用优惠:\n'+
        loadPromotion[0].type+'，省'+thirtySubsix[0].saved+'元\n'+
        '-----------------------------------\n'+
        '总计：'+thirtySubsix[0].summary+'元\n';
    }else{
      result+='-----------------------------------\n'+
        '总计：'+nodiscount[0].summary+'元\n';
    }
    result+='===================================';
  return result;
}
function bestCharge(inputs){
  let cartItem = cartItems(inputs),
    loadAllItem =  loadAllItems(),
    ReceiptItem = getReceiptItems(loadAllItem,cartItem),
  loadPromotion = loadPromotions(),
  payhalfmoneys = payHalfMoney(ReceiptItem,loadPromotion),
  nodiscounts = noDiscount(ReceiptItem),
  thirtySubsixs =thirtySubSix(ReceiptItem);
  let bestCharge =printReceipts(ReceiptItem,loadPromotion,payhalfmoneys,nodiscounts,thirtySubsixs);
  return  bestCharge;
}
module.exports=bestCharge;
