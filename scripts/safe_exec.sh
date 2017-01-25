function safe_exec {
    echo -e "\e[32;1m**** [Executing $@]\e[0m"
    "$@"
    local status=$?
    if [ $status -ne 0 ]; then
        echo -e "\e[31;1m**** [Error with $@ \e[0m]" >&2
        exit 1
    fi
    return $status
}