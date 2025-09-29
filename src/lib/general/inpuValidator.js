export const  validatePhoneNumber = (phone) => {
    if (!phone && typeof phone != "string") return false;
    return !isNaN(phone) &&
        !isNaN(parseFloat(phone))
}